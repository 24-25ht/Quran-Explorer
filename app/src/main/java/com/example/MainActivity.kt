package com.example

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color as AndroidColor
import android.location.Geocoder
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.location.LocationManagerCompat
import androidx.core.view.WindowCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import com.example.ui.theme.AlabasterBg
import com.example.ui.theme.AlabasterSurfaceVariant
import com.example.ui.theme.AlabasterText
import com.example.ui.theme.ChampagneGold
import com.example.ui.theme.EmeraldLightPrimary
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.EspressoGoldTaupe
import com.example.ui.theme.EspressoSageAccent
import com.example.ui.theme.EspressoSepiaBg
import com.example.ui.theme.EspressoSepiaSurfaceVariant
import com.example.ui.theme.EspressoSepiaText
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.ObsidianBg
import com.example.ui.theme.ObsidianSurface
import com.example.ui.theme.ObsidianSurfaceVariant
import com.example.ui.theme.ObsidianText
import com.example.ui.theme.ObsidianTextSecondary
import com.example.ui.theme.PlusJakartaSansFontFamily
import com.example.ui.theme.WarmGoldLight
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.Executors
import kotlinx.coroutines.delay
import org.json.JSONObject

private const val PREFS_NAME = "quran_explorer_prefs"
private const val KEY_THEME_MODE = "theme_mode"

class MainActivity : ComponentActivity() {

  private var webView: WebView? = null
  private val mainHandler = Handler(Looper.getMainLooper())
  private val geocodeExecutor = Executors.newSingleThreadExecutor()

  private var activeCancellationSignal: CancellationSignal? = null
  private var activeLocationListener: LocationListener? = null
  private var activeTimeoutRunnable: Runnable? = null

  private lateinit var locationPermissionLauncher: ActivityResultLauncher<String>
  private lateinit var notificationPermissionLauncher: ActivityResultLauncher<String>
  private var notificationPermissionPrompted = false

  private fun applyNativeSystemBars(mode: String) {
    if (isFinishing || isDestroyed) return
    val isLight = mode == "light" || mode == "sepia-light"
    val hex = when (mode) {
      "light" -> "#F3EFE6"
      "sepia-light" -> "#EFE4CA"
      "sepia-dark" -> "#15120F"
      else -> "#070C10"
    }
    val barHex = when (mode) {
      "light" -> "#FFFFFF"
      "sepia-light" -> "#FAF2DE"
      "sepia-dark" -> "#1B1713"
      else -> "#0D151C"
    }
    try {
      val parsedBg = AndroidColor.parseColor(hex)
      val parsedBar = AndroidColor.parseColor(barHex)
      window.statusBarColor = parsedBar
      window.navigationBarColor = parsedBar
      val insetsController = WindowCompat.getInsetsController(window, window.decorView)
      insetsController.isAppearanceLightStatusBars = isLight
      insetsController.isAppearanceLightNavigationBars = isLight
      webView?.setBackgroundColor(parsedBg)
    } catch (_: Throwable) {}
  }

  private fun cleanupLocationRequests() {
    activeTimeoutRunnable?.let { mainHandler.removeCallbacks(it) }
    activeTimeoutRunnable = null
    try {
      activeCancellationSignal?.cancel()
    } catch (_: Throwable) {}
    activeCancellationSignal = null
    val listener = activeLocationListener
    activeLocationListener = null
    if (listener != null) {
      try {
        val lm = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        lm?.removeUpdates(listener)
      } catch (_: Throwable) {}
    }
  }

  private fun dispatchLocationJsonToWeb(payload: JSONObject) {
    val jsonStr = payload.toString()
    mainHandler.post {
      val wv = webView ?: return@post
      val safeJs = "window.onNativeLocationResult && window.onNativeLocationResult($jsonStr);"
      wv.evaluateJavascript(safeJs, null)
    }
  }

  private fun emitLocationError(status: String, message: String) {
    cleanupLocationRequests()
    val payload = JSONObject().apply {
      put("status", status)
      put("message", message)
    }
    dispatchLocationJsonToWeb(payload)
  }

  private fun publishResolvedLocation(location: Location) {
    cleanupLocationRequests()
    val lat = location.latitude
    val lon = location.longitude
    val tzOffsetHours = TimeZone.getDefault().getOffset(System.currentTimeMillis()) / 3600000.0

    geocodeExecutor.execute {
      var city = ""
      var country = ""
      var countryCode = ""
      try {
        @Suppress("DEPRECATION")
        val geocoder = Geocoder(this, Locale.ENGLISH)
        @Suppress("DEPRECATION")
        val list = geocoder.getFromLocation(lat, lon, 1)
        if (!list.isNullOrEmpty()) {
          val addr = list[0]
          city = addr.locality ?: addr.subAdminArea ?: addr.adminArea ?: ""
          country = addr.countryName ?: ""
          countryCode = (addr.countryCode ?: "").uppercase(Locale.ENGLISH)
        }
      } catch (_: Throwable) {
        // Offline or Geocoder unavailable; JS falls back to nearest regional coordinates
      }
      val payload = JSONObject().apply {
        put("status", "ok")
        put("latitude", lat)
        put("longitude", lon)
        put("timezoneOffset", tzOffsetHours)
        put("city", city)
        put("country", country)
        put("countryCode", countryCode)
      }
      dispatchLocationJsonToWeb(payload)
    }
  }

  fun startTemporaryLocationLookup() {
    mainHandler.post {
      if (isFinishing || isDestroyed) return@post
      val hasCoarse = ContextCompat.checkSelfPermission(
        this,
        Manifest.permission.ACCESS_COARSE_LOCATION
      ) == PackageManager.PERMISSION_GRANTED
      if (!hasCoarse) {
        locationPermissionLauncher.launch(Manifest.permission.ACCESS_COARSE_LOCATION)
        return@post
      }
      acquireSingleShotCoarseLocation()
    }
  }

  @SuppressLint("MissingPermission")
  private fun acquireSingleShotCoarseLocation() {
    cleanupLocationRequests()
    val lm = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
    if (lm == null) {
      emitLocationError("unavailable", "Location manager is unavailable on this device.")
      return
    }
    if (!LocationManagerCompat.isLocationEnabled(lm)) {
      emitLocationError("disabled", "Device location is turned off. Using regional presets instead.")
      return
    }

    val provider = when {
      lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && lm.isProviderEnabled(LocationManager.FUSED_PROVIDER) ->
        LocationManager.FUSED_PROVIDER
      lm.isProviderEnabled(LocationManager.GPS_PROVIDER) -> LocationManager.GPS_PROVIDER
      else -> null
    }

    val recentLastKnown = try {
      val candidates = listOf(
        LocationManager.NETWORK_PROVIDER,
        LocationManager.PASSIVE_PROVIDER,
        LocationManager.GPS_PROVIDER
      ).mapNotNull { p ->
        try {
          lm.getLastKnownLocation(p)
        } catch (_: Throwable) {
          null
        }
      }
      candidates.maxByOrNull { it.time }
    } catch (_: Throwable) {
      null
    }

    val fifteenMinMs = 15 * 60 * 1000L
    if (recentLastKnown != null && (System.currentTimeMillis() - recentLastKnown.time) < fifteenMinMs) {
      publishResolvedLocation(recentLastKnown)
      return
    }

    if (provider == null) {
      if (recentLastKnown != null) {
        publishResolvedLocation(recentLastKnown)
      } else {
        emitLocationError("disabled", "No coarse location provider is enabled. Select a city manually.")
      }
      return
    }

    var resolved = false
    val timeoutTask = Runnable {
      if (resolved) return@Runnable
      resolved = true
      if (recentLastKnown != null) {
        publishResolvedLocation(recentLastKnown)
      } else {
        emitLocationError("timeout", "Location lookup timed out. Select a city or preset instead.")
      }
    }
    activeTimeoutRunnable = timeoutTask
    mainHandler.postDelayed(timeoutTask, 10_000L)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      val signal = CancellationSignal()
      activeCancellationSignal = signal
      try {
        lm.getCurrentLocation(provider, signal, mainExecutor) { loc ->
          if (resolved) return@getCurrentLocation
          resolved = true
          if (loc != null) {
            publishResolvedLocation(loc)
          } else if (recentLastKnown != null) {
            publishResolvedLocation(recentLastKnown)
          } else {
            emitLocationError("unavailable", "Unable to acquire your current area right now.")
          }
        }
      } catch (_: Throwable) {
        if (!resolved) {
          resolved = true
          if (recentLastKnown != null) {
            publishResolvedLocation(recentLastKnown)
          } else {
            emitLocationError("unavailable", "Unable to acquire your current area right now.")
          }
        }
      }
    } else {
      val listener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
          if (resolved) return
          resolved = true
          publishResolvedLocation(location)
        }

        @Deprecated("Deprecated in Java")
        override fun onStatusChanged(providerName: String?, status: Int, extras: Bundle?) {}
        override fun onProviderEnabled(providerName: String) {}
        override fun onProviderDisabled(providerName: String) {
          if (!resolved && recentLastKnown == null) {
            resolved = true
            emitLocationError("disabled", "Location provider disabled.")
          }
        }
      }
      activeLocationListener = listener
      try {
        @Suppress("DEPRECATION")
        lm.requestSingleUpdate(provider, listener, Looper.getMainLooper())
      } catch (_: Throwable) {
        if (!resolved) {
          resolved = true
          if (recentLastKnown != null) {
            publishResolvedLocation(recentLastKnown)
          } else {
            emitLocationError("unavailable", "Location lookup failed on this device.")
          }
        }
      }
    }
  }

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    locationPermissionLauncher = registerForActivityResult(
      ActivityResultContracts.RequestPermission()
    ) { granted ->
      if (granted) {
        acquireSingleShotCoarseLocation()
      } else {
        emitLocationError("denied", "Location permission denied. Please choose your city or region below.")
      }
    }

    notificationPermissionLauncher = registerForActivityResult(
      ActivityResultContracts.RequestPermission()
    ) { _ ->
      // Notification service works gracefully regardless of user grant/deny
    }

    MediaPlaybackService.setActionListener { action, seekMs ->
      val wv = webView ?: return@setActionListener
      if (action == "seek" && seekMs >= 0L) {
        wv.evaluateJavascript("window.onNativeMediaSeek && window.onNativeMediaSeek($seekMs);", null)
      } else {
        val safeAction = JSONObject.quote(action)
        wv.evaluateJavascript("window.onNativeMediaAction && window.onNativeMediaAction($safeAction);", null)
      }
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
    }

    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val initialThemeMode = prefs.getString(KEY_THEME_MODE, "dark") ?: "dark"
    applyNativeSystemBars(initialThemeMode)

    val assetsHandler = WebViewAssetLoader.AssetsPathHandler(this)
    val resourcesHandler = WebViewAssetLoader.ResourcesPathHandler(this)
    val safePathHandler = WebViewAssetLoader.PathHandler { path ->
      val resolvedPath = if (path.isBlank() || path == "/") "index.html" else path.trimStart('/')
      try {
        assetsHandler.handle(resolvedPath)
      } catch (e: Exception) {
        null
      }
    }

    val assetLoader = WebViewAssetLoader.Builder()
      .setDomain("appassets.androidplatform.net")
      .addPathHandler("/assets/", safePathHandler)
      .addPathHandler("/res/", resourcesHandler)
      .build()

    fun handleIntercept(url: Uri): WebResourceResponse? {
      val normalizedUri = normalizeAssetUri(url)
      val response = try {
        assetLoader.shouldInterceptRequest(normalizedUri)
      } catch (_: Throwable) {
        null
      } ?: return null
      val lowerPath = normalizedUri.path?.lowercase() ?: ""
      if (lowerPath.endsWith(".ttf")) {
        return try {
          val headers = (response.responseHeaders?.toMutableMap() ?: mutableMapOf()).apply {
            putIfAbsent("Access-Control-Allow-Origin", "*")
          }
          WebResourceResponse(
            "font/ttf",
            response.encoding ?: "UTF-8",
            200,
            "OK",
            headers,
            response.data,
          )
        } catch (_: Throwable) {
          response
        }
      }
      return response
    }

    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        val wv = webView
        if (wv != null) {
          wv.evaluateJavascript("(function(){ try { if (typeof window.handleAndroidBack === 'function') { return window.handleAndroidBack(); } } catch(e){} return false; })()") { result ->
            val handled = result == "true" || result == "\"true\""
            if (!handled) {
              if (wv.canGoBack()) {
                wv.goBack()
              } else {
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
              }
            }
          }
        } else {
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
        }
      }
    })

    setContent {
      var activeThemeMode by remember { mutableStateOf(initialThemeMode) }
      val isLightMode = activeThemeMode == "light" || activeThemeMode == "sepia-light"
      val outerBgColor = when (activeThemeMode) {
        "light" -> AlabasterBg
        "sepia-light" -> Color(0xFFEFE4CA)
        "sepia-dark" -> EspressoSepiaBg
        else -> ObsidianBg
      }

      LaunchedEffect(activeThemeMode) {
        applyNativeSystemBars(activeThemeMode)
      }

      MyApplicationTheme(darkTheme = !isLightMode, dynamicColor = false) {
        var webPageReady by remember { mutableStateOf(false) }

        LaunchedEffect(Unit) {
          delay(1500)
          webPageReady = true
        }

        val showSplash = !webPageReady

        Box(
          modifier = Modifier
            .fillMaxSize()
            .background(outerBgColor)
            .statusBarsPadding()
            .navigationBarsPadding()
        ) {
          QuranWebView(
            initialThemeMode = initialThemeMode,
            onRequestIntercept = { handleIntercept(it) },
            onWebViewCreated = { wv ->
              webView = wv
              applyNativeSystemBars(activeThemeMode)
            },
            onPageReady = { webPageReady = true },
            onThemeModeChanged = { newMode ->
              activeThemeMode = newMode
              prefs.edit().putString(KEY_THEME_MODE, newMode).apply()
            },
            onRequestTemporaryLocation = { startTemporaryLocationLookup() },
            onUpdateMediaNotification = { surah, verse, surahName, surahArabic, reciterName, isPlaying, positionMs, durationMs, playbackRate ->
              if (isPlaying && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !notificationPermissionPrompted) {
                val hasNotifPerm = ContextCompat.checkSelfPermission(
                  this@MainActivity,
                  Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
                if (!hasNotifPerm) {
                  notificationPermissionPrompted = true
                  try {
                    notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                  } catch (_: Throwable) {}
                }
              }
              MediaPlaybackService.startOrUpdate(
                context = this@MainActivity,
                surah = surah,
                verse = verse,
                surahName = surahName,
                surahArabic = surahArabic,
                reciterName = reciterName,
                isPlaying = isPlaying,
                positionMs = positionMs,
                durationMs = durationMs,
                playbackRate = playbackRate.toFloat()
              )
            },
            onStopMediaNotification = {
              MediaPlaybackService.stop(this@MainActivity)
            }
          )

          AnimatedVisibility(
            visible = showSplash,
            exit = fadeOut(animationSpec = tween(durationMillis = 220))
          ) {
            QuranSplashOverlay(themeMode = activeThemeMode)
          }
        }
      }
    }
  }

  override fun onDestroy() {
    cleanupLocationRequests()
    MediaPlaybackService.setActionListener(null)
    if (isFinishing) {
      MediaPlaybackService.stop(this)
    }
    geocodeExecutor.shutdownNow()
    super.onDestroy()
  }

  private fun normalizeAssetUri(uri: Uri): Uri {
    val path = uri.path ?: return uri
    return if (path == "/assets" || path == "/assets/") {
      uri.buildUpon().path("/assets/index.html").build()
    } else {
      uri
    }
  }
}

class AndroidThemeBridge(
  private val onThemeUpdate: (String) -> Unit
) {
  @JavascriptInterface
  fun setSystemTheme(mode: String) {
    val normalized = when (mode) {
      "light", "sepia-light", "sepia-dark", "dark" -> mode
      else -> "dark"
    }
    onThemeUpdate(normalized)
  }
}

class AndroidLocationBridge(
  private val onRequestLocation: () -> Unit
) {
  @JavascriptInterface
  fun requestTemporaryLocation() {
    onRequestLocation()
  }
}

class AndroidMediaBridge(
  private val onUpdate: (
    surah: Int,
    verse: Int,
    surahName: String,
    surahArabic: String,
    reciterName: String,
    isPlaying: Boolean,
    positionMs: Long,
    durationMs: Long,
    playbackRate: Double
  ) -> Unit,
  private val onStop: () -> Unit
) {
  @JavascriptInterface
  fun updateMediaState(
    surah: Int,
    verse: Int,
    surahName: String,
    surahArabic: String,
    reciterName: String,
    isPlaying: Boolean,
    positionMs: Long,
    durationMs: Long,
    playbackRate: Double
  ) {
    onUpdate(surah, verse, surahName, surahArabic, reciterName, isPlaying, positionMs, durationMs, playbackRate)
  }

  @JavascriptInterface
  fun stopMediaNotification() {
    onStop()
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun QuranWebView(
  initialThemeMode: String = "dark",
  onRequestIntercept: (Uri) -> WebResourceResponse?,
  onWebViewCreated: (WebView) -> Unit,
  onPageReady: () -> Unit = {},
  onThemeModeChanged: (String) -> Unit = {},
  onRequestTemporaryLocation: () -> Unit = {},
  onUpdateMediaNotification: (Int, Int, String, String, String, Boolean, Long, Long, Double) -> Unit = { _, _, _, _, _, _, _, _, _ -> },
  onStopMediaNotification: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  AndroidView(
    modifier = modifier
      .fillMaxSize()
      .imePadding(),
    factory = { context ->
      val startBgHex = when (initialThemeMode) {
        "light" -> "#F3EFE6"
        "sepia-light" -> "#EFE4CA"
        "sepia-dark" -> "#15120F"
        else -> "#070C10"
      }
      WebView(context).apply {
        setBackgroundColor(AndroidColor.parseColor(startBgHex))
        overScrollMode = android.view.View.OVER_SCROLL_NEVER
        isVerticalScrollBarEnabled = false
        isHorizontalScrollBarEnabled = false
        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          mediaPlaybackRequiresUserGesture = false
          cacheMode = WebSettings.LOAD_DEFAULT
          mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        addJavascriptInterface(
          AndroidThemeBridge { mode ->
            post { onThemeModeChanged(mode) }
          },
          "AndroidThemeBridge"
        )
        addJavascriptInterface(
          AndroidLocationBridge {
            post { onRequestTemporaryLocation() }
          },
          "AndroidLocationBridge"
        )
        addJavascriptInterface(
          AndroidMediaBridge(
            onUpdate = { s, v, sName, sAr, rec, playing, posMs, durMs, rate ->
              post { onUpdateMediaNotification(s, v, sName, sAr, rec, playing, posMs, durMs, rate) }
            },
            onStop = {
              post { onStopMediaNotification() }
            }
          ),
          "AndroidMediaBridge"
        )

        webChromeClient = object : WebChromeClient() {
          override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            consoleMessage?.let {
              Log.d("QuranWebView", "${it.message()} [${it.sourceId()}:${it.lineNumber()}]")
            }
            return true
          }
        }

        webViewClient = object : WebViewClientCompat() {
          override fun shouldInterceptRequest(
            view: WebView,
            request: WebResourceRequest
          ): WebResourceResponse? {
            return onRequestIntercept(request.url)
          }

          override fun shouldOverrideUrlLoading(
            view: WebView,
            request: WebResourceRequest
          ): Boolean {
            val uri = request.url
            val host = uri.host?.lowercase(Locale.ENGLISH) ?: ""
            val scheme = uri.scheme?.lowercase(Locale.ENGLISH) ?: ""
            if ((scheme == "https" || scheme == "http") && host != "appassets.androidplatform.net") {
              try {
                view.context.startActivity(Intent(Intent.ACTION_VIEW, uri))
              } catch (_: Throwable) {}
              return true
            }
            return false
          }

          override fun onPageFinished(view: WebView, url: String) {
            super.onPageFinished(view, url)
            onPageReady()
          }

          override fun onRenderProcessGone(
            view: WebView,
            detail: RenderProcessGoneDetail
          ): Boolean {
            Log.w("QuranWebView", "Render process gone (didCrash: ${detail.didCrash()})")
            view.post {
              view.loadUrl("https://appassets.androidplatform.net/assets/index.html?appbuild=${BuildConfig.VERSION_CODE}")
            }
            return true
          }
        }

        loadUrl("https://appassets.androidplatform.net/assets/index.html?appbuild=${BuildConfig.VERSION_CODE}")
        onWebViewCreated(this)
      }
    }
  )
}

@Composable
fun QuranSplashOverlay(
  themeMode: String = "dark",
  modifier: Modifier = Modifier
) {
  val isLight = themeMode == "light" || themeMode == "sepia-light"
  val isSepiaDark = themeMode == "sepia-dark"
  val gradientColors = when (themeMode) {
    "light" -> listOf(Color(0xFFFAF6EE), AlabasterBg, Color(0xFFEBE4D4))
    "sepia-light" -> listOf(Color(0xFFFAF2DE), Color(0xFFEFE4CA), Color(0xFFE7D8B6))
    "sepia-dark" -> listOf(Color(0xFF1B1713), EspressoSepiaBg, Color(0xFF120F0C))
    else -> listOf(Color(0xFF0A161D), ObsidianBg, Color(0xFF091217))
  }
  val titleColor = when {
    isLight -> AlabasterText
    isSepiaDark -> EspressoSepiaText
    else -> ObsidianText
  }
  val accentColor = when {
    isLight -> EmeraldLightPrimary
    isSepiaDark -> EspressoSageAccent
    else -> EmeraldPrimary
  }
  val goldColor = when {
    isLight -> WarmGoldLight
    isSepiaDark -> EspressoGoldTaupe
    else -> ChampagneGold
  }
  val trackColor = when {
    isLight -> AlabasterSurfaceVariant
    isSepiaDark -> EspressoSepiaSurfaceVariant
    else -> ObsidianSurfaceVariant
  }

  Box(
    modifier = modifier
      .fillMaxSize()
      .background(Brush.verticalGradient(colors = gradientColors)),
    contentAlignment = Alignment.Center
  ) {
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center,
      modifier = Modifier.padding(24.dp)
    ) {
      Box(
        modifier = Modifier
          .size(92.dp)
          .clip(RoundedCornerShape(26.dp))
          .background(
            Brush.linearGradient(
              colors = listOf(
                accentColor.copy(alpha = 0.16f),
                goldColor.copy(alpha = 0.14f)
              )
            )
          )
          .border(1.2.dp, goldColor.copy(alpha = 0.45f), RoundedCornerShape(26.dp)),
        contentAlignment = Alignment.Center
      ) {
        Canvas(modifier = Modifier.size(48.dp)) {
          val side = size.minDimension * 0.62f
          val topLeft = Offset((size.width - side) / 2f, (size.height - side) / 2f)
          val radius = CornerRadius(4.dp.toPx(), 4.dp.toPx())
          drawRoundRect(
            color = goldColor,
            topLeft = topLeft,
            size = Size(side, side),
            cornerRadius = radius,
            style = Stroke(width = 2.dp.toPx())
          )
          rotate(degrees = 45f) {
            drawRoundRect(
              color = accentColor,
              topLeft = topLeft,
              size = Size(side, side),
              cornerRadius = radius,
              style = Stroke(width = 2.dp.toPx())
            )
          }
          drawCircle(
            color = goldColor,
            radius = 3.2.dp.toPx(),
            center = center
          )
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      Text(
        text = "Quran Explorer",
        fontFamily = PlusJakartaSansFontFamily,
        color = titleColor,
        fontSize = 24.sp,
        fontWeight = FontWeight.ExtraBold,
        letterSpacing = (-0.3).sp
      )

      Spacer(modifier = Modifier.height(6.dp))

      Text(
        text = "OFFLINE EDITION · v3.5",
        fontFamily = PlusJakartaSansFontFamily,
        color = goldColor,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 2.2.sp
      )

      Spacer(modifier = Modifier.height(26.dp))

      LinearProgressIndicator(
        modifier = Modifier
          .width(156.dp)
          .height(3.dp)
          .clip(RoundedCornerShape(999.dp)),
        color = accentColor,
        trackColor = trackColor
      )
    }
  }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
  Text(text = "Hello $name!", modifier = modifier)
}

@Preview(showBackground = true, name = "Splash Screen Dark")
@Composable
fun QuranExplorerSplashPreview() {
  MyApplicationTheme(darkTheme = true, dynamicColor = false) {
    QuranSplashOverlay(themeMode = "dark")
  }
}

@Preview(showBackground = true, name = "Splash Screen Light")
@Composable
fun QuranExplorerSplashLightPreview() {
  MyApplicationTheme(darkTheme = false, dynamicColor = false) {
    QuranSplashOverlay(themeMode = "light")
  }
}

@Preview(showBackground = true, name = "App Shell Preview")
@Composable
fun QuranExplorerShellPreview() {
  MyApplicationTheme(darkTheme = true, dynamicColor = false) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .background(ObsidianBg)
        .padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
      Surface(
        shape = RoundedCornerShape(14.dp),
        color = ObsidianSurface,
        modifier = Modifier
          .fillMaxWidth()
          .border(1.dp, ChampagneGold.copy(alpha = 0.35f), RoundedCornerShape(14.dp))
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Text(
            text = "Quran Explorer v3.5",
            style = MaterialTheme.typography.titleMedium,
            color = ChampagneGold,
            fontWeight = FontWeight.Bold
          )
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            text = "Bundled Uthmanic Hafs, IndoPak Nastaleeq, and Noto Naskh Arabic fonts, multi-script Tajweed highlighting, synced Word-by-Word, and offline Tafsir.",
            style = MaterialTheme.typography.bodySmall,
            color = ObsidianTextSecondary
          )
        }
      }

      Row(
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        listOf("114 Surahs" to "Offline Tafsir", "Prayer Times" to "GPS & Regional Presets").forEach { (title, sub) ->
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = ObsidianSurfaceVariant,
            modifier = Modifier.weight(1f)
          ) {
            Column(modifier = Modifier.padding(12.dp)) {
              Text(text = title, color = EmeraldPrimary, fontWeight = FontWeight.Bold, fontSize = 15.sp)
              Text(text = sub, color = ObsidianTextSecondary, fontSize = 11.sp)
            }
          }
        }
      }
    }
  }
}

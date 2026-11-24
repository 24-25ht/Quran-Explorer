package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Quran Explorer", appName)
  }

  @Test
  fun `verify asset loader intercepts files`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val assetsHandler = androidx.webkit.WebViewAssetLoader.AssetsPathHandler(context)
    val safePathHandler = androidx.webkit.WebViewAssetLoader.PathHandler { path ->
      val resolvedPath = if (path.isBlank() || path == "/") "index.html" else path.trimStart('/')
      try {
        assetsHandler.handle(resolvedPath)
      } catch (e: Exception) {
        null
      }
    }
    val assetLoader = androidx.webkit.WebViewAssetLoader.Builder()
      .setDomain("appassets.androidplatform.net")
      .addPathHandler("/assets/", safePathHandler)
      .build()

    val indexResponse = assetLoader.shouldInterceptRequest(android.net.Uri.parse("https://appassets.androidplatform.net/assets/index.html"))
    org.junit.Assert.assertNotNull("index.html must be intercepted", indexResponse)

    val queryResponse = assetLoader.shouldInterceptRequest(android.net.Uri.parse("https://appassets.androidplatform.net/assets/index.html?appbuild=24"))
    org.junit.Assert.assertNotNull("index.html?appbuild=24 must be intercepted", queryResponse)

    val stylesResponse = assetLoader.shouldInterceptRequest(android.net.Uri.parse("https://appassets.androidplatform.net/assets/styles.css?v=24"))
    org.junit.Assert.assertNotNull("styles.css must be intercepted", stylesResponse)

    val appJsResponse = assetLoader.shouldInterceptRequest(android.net.Uri.parse("https://appassets.androidplatform.net/assets/app.js?v=24"))
    org.junit.Assert.assertNotNull("app.js must be intercepted", appJsResponse)

    val jsResponse = assetLoader.shouldInterceptRequest(android.net.Uri.parse("https://appassets.androidplatform.net/assets/quran-data.js?v=24"))
    org.junit.Assert.assertNotNull("quran-data.js must be intercepted", jsResponse)

    val audioJsResponse = assetLoader.shouldInterceptRequest(android.net.Uri.parse("https://appassets.androidplatform.net/assets/quran-audio-downloads.js?v=24"))
    org.junit.Assert.assertNotNull("quran-audio-downloads.js must be intercepted", audioJsResponse)

    val resourcesLoader = androidx.webkit.WebViewAssetLoader.Builder()
      .setDomain("appassets.androidplatform.net")
      .addPathHandler("/res/", androidx.webkit.WebViewAssetLoader.ResourcesPathHandler(context))
      .build()
    val bundledFonts = listOf(
      "plus_jakarta_sans.ttf",
      "amiri.ttf",
      "uthmanic_hafs.ttf",
      "indopak_nastaleeq.ttf",
      "noto_naskh_arabic.ttf"
    )
    bundledFonts.forEach { fontFile ->
      val rawFontResponse = resourcesLoader.shouldInterceptRequest(
        android.net.Uri.parse("https://appassets.androidplatform.net/res/font/$fontFile")
      )
      org.junit.Assert.assertNotNull("$fontFile must be intercepted", rawFontResponse)
      val safeFontResponse = android.webkit.WebResourceResponse(
        "font/ttf",
        rawFontResponse?.encoding ?: "UTF-8",
        200,
        "OK",
        mapOf("Access-Control-Allow-Origin" to "*"),
        rawFontResponse?.data
      )
      assertEquals(200, safeFontResponse.statusCode)
      assertEquals("OK", safeFontResponse.reasonPhrase)
      org.junit.Assert.assertNotNull("$fontFile stream must be readable", safeFontResponse.data)
    }
  }

  @Test
  fun `verify least privilege location permission in manifest`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val packageInfo = context.packageManager.getPackageInfo(
      context.packageName,
      android.content.pm.PackageManager.GET_PERMISSIONS
    )
    val permissions = packageInfo.requestedPermissions?.toSet().orEmpty()
    org.junit.Assert.assertTrue(
      "ACCESS_COARSE_LOCATION must be declared",
      permissions.contains(android.Manifest.permission.ACCESS_COARSE_LOCATION)
    )
    org.junit.Assert.assertFalse(
      "ACCESS_FINE_LOCATION should not be requested",
      permissions.contains(android.Manifest.permission.ACCESS_FINE_LOCATION)
    )
    org.junit.Assert.assertFalse(
      "ACCESS_BACKGROUND_LOCATION should not be requested",
      permissions.contains(android.Manifest.permission.ACCESS_BACKGROUND_LOCATION)
    )
  }
}

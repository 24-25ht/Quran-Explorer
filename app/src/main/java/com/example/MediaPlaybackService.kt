package com.example

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.media.MediaMetadata
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat

class MediaPlaybackService : Service() {

  companion object {
    const val CHANNEL_ID = "quran_playback_channel"
    const val NOTIFICATION_ID = 3501

    const val ACTION_UPDATE = "com.example.action.MEDIA_UPDATE"
    const val ACTION_STOP_SERVICE = "com.example.action.MEDIA_STOP_SERVICE"
    const val ACTION_PREV = "com.example.action.MEDIA_PREV"
    const val ACTION_PLAY_PAUSE = "com.example.action.MEDIA_PLAY_PAUSE"
    const val ACTION_NEXT = "com.example.action.MEDIA_NEXT"
    const val ACTION_DISMISS = "com.example.action.MEDIA_DISMISS"

    const val EXTRA_SURAH = "surah"
    const val EXTRA_VERSE = "verse"
    const val EXTRA_SURAH_NAME = "surah_name"
    const val EXTRA_SURAH_ARABIC = "surah_arabic"
    const val EXTRA_RECITER_NAME = "reciter_name"
    const val EXTRA_IS_PLAYING = "is_playing"
    const val EXTRA_POSITION_MS = "position_ms"
    const val EXTRA_DURATION_MS = "duration_ms"
    const val EXTRA_PLAYBACK_RATE = "playback_rate"

    @Volatile
    private var actionListener: ((action: String, seekMs: Long) -> Unit)? = null

    fun setActionListener(listener: ((action: String, seekMs: Long) -> Unit)?) {
      actionListener = listener
    }

    fun startOrUpdate(
      context: Context,
      surah: Int,
      verse: Int,
      surahName: String,
      surahArabic: String,
      reciterName: String,
      isPlaying: Boolean,
      positionMs: Long,
      durationMs: Long,
      playbackRate: Float
    ) {
      val intent = Intent(context, MediaPlaybackService::class.java).apply {
        action = ACTION_UPDATE
        putExtra(EXTRA_SURAH, surah)
        putExtra(EXTRA_VERSE, verse)
        putExtra(EXTRA_SURAH_NAME, surahName)
        putExtra(EXTRA_SURAH_ARABIC, surahArabic)
        putExtra(EXTRA_RECITER_NAME, reciterName)
        putExtra(EXTRA_IS_PLAYING, isPlaying)
        putExtra(EXTRA_POSITION_MS, positionMs.coerceAtLeast(0L))
        putExtra(EXTRA_DURATION_MS, durationMs.coerceAtLeast(0L))
        putExtra(EXTRA_PLAYBACK_RATE, playbackRate.coerceIn(0.5f, 2.0f))
      }
      try {
        if (isPlaying) {
          ContextCompat.startForegroundService(context, intent)
        } else {
          context.startService(intent)
        }
      } catch (_: Throwable) {
        try {
          context.startService(intent)
        } catch (_: Throwable) {}
      }
    }

    fun stop(context: Context) {
      try {
        context.stopService(Intent(context, MediaPlaybackService::class.java))
      } catch (_: Throwable) {}
    }
  }

  private val mainHandler = Handler(Looper.getMainLooper())
  private var mediaSession: MediaSession? = null
  private var artworkBitmap: Bitmap? = null

  private var currentSurah: Int = 1
  private var currentVerse: Int = 1
  private var currentSurahName: String = "Al-Fatihah"
  private var currentSurahArabic: String = "الفاتحة"
  private var currentReciterName: String = "Mishary Rashid Alafasy"
  private var currentIsPlaying: Boolean = false
  private var currentPositionMs: Long = 0L
  private var currentDurationMs: Long = 0L
  private var currentPlaybackRate: Float = 1.0f
  private var isForegroundActive: Boolean = false

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
    artworkBitmap = buildQuranMediaArtwork()
    setupMediaSession()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_UPDATE -> {
        currentSurah = intent.getIntExtra(EXTRA_SURAH, currentSurah)
        currentVerse = intent.getIntExtra(EXTRA_VERSE, currentVerse)
        currentSurahName = intent.getStringExtra(EXTRA_SURAH_NAME)?.ifBlank { "Surah $currentSurah" } ?: currentSurahName
        currentSurahArabic = intent.getStringExtra(EXTRA_SURAH_ARABIC) ?: ""
        currentReciterName = intent.getStringExtra(EXTRA_RECITER_NAME)?.ifBlank { "Reciter" } ?: currentReciterName
        currentIsPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, false)
        currentPositionMs = intent.getLongExtra(EXTRA_POSITION_MS, 0L)
        currentDurationMs = intent.getLongExtra(EXTRA_DURATION_MS, 0L)
        currentPlaybackRate = intent.getFloatExtra(EXTRA_PLAYBACK_RATE, 1.0f)

        updateMediaSessionStateAndMetadata()
        publishNotification()
      }
      ACTION_PREV -> {
        notifyWebAction("prev", -1L)
      }
      ACTION_PLAY_PAUSE -> {
        val nextAction = if (currentIsPlaying) "pause" else "play"
        currentIsPlaying = !currentIsPlaying
        updateMediaSessionStateAndMetadata()
        publishNotification()
        notifyWebAction(nextAction, -1L)
      }
      ACTION_NEXT -> {
        notifyWebAction("next", -1L)
      }
      ACTION_DISMISS, ACTION_STOP_SERVICE -> {
        currentIsPlaying = false
        notifyWebAction("stop", -1L)
        stopSelfCleanly()
      }
      else -> {
        updateMediaSessionStateAndMetadata()
        publishNotification()
      }
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    isForegroundActive = false
    try {
      mediaSession?.isActive = false
      mediaSession?.release()
    } catch (_: Throwable) {}
    mediaSession = null
    try {
      artworkBitmap?.recycle()
    } catch (_: Throwable) {}
    artworkBitmap = null
    super.onDestroy()
  }

  private fun notifyWebAction(action: String, seekMs: Long) {
    val listener = actionListener ?: return
    mainHandler.post {
      listener(action, seekMs)
    }
  }

  private fun stopSelfCleanly() {
    isForegroundActive = false
    try {
      ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    } catch (_: Throwable) {}
    try {
      val nm = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
      nm?.cancel(NOTIFICATION_ID)
    } catch (_: Throwable) {}
    stopSelf()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
      val existing = manager.getNotificationChannel(CHANNEL_ID)
      if (existing == null) {
        val channel = NotificationChannel(
          CHANNEL_ID,
          "Quran Recitation",
          NotificationManager.IMPORTANCE_LOW
        ).apply {
          description = "Playback controls and current Ayah display for Quran Explorer recitations."
          setShowBadge(false)
          lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        }
        manager.createNotificationChannel(channel)
      }
    }
  }

  private fun setupMediaSession() {
    val session = MediaSession(this, "QuranExplorerMediaSession")
    session.setCallback(object : MediaSession.Callback() {
      override fun onPlay() {
        currentIsPlaying = true
        updateMediaSessionStateAndMetadata()
        publishNotification()
        notifyWebAction("play", -1L)
      }

      override fun onPause() {
        currentIsPlaying = false
        updateMediaSessionStateAndMetadata()
        publishNotification()
        notifyWebAction("pause", -1L)
      }

      override fun onSkipToNext() {
        notifyWebAction("next", -1L)
      }

      override fun onSkipToPrevious() {
        notifyWebAction("prev", -1L)
      }

      override fun onSeekTo(pos: Long) {
        currentPositionMs = pos.coerceAtLeast(0L)
        updateMediaSessionStateAndMetadata()
        notifyWebAction("seek", currentPositionMs)
      }

      override fun onStop() {
        currentIsPlaying = false
        notifyWebAction("stop", -1L)
        stopSelfCleanly()
      }
    })
    session.isActive = true
    mediaSession = session
  }

  private fun updateMediaSessionStateAndMetadata() {
    val session = mediaSession ?: return
    val title = "$currentSurahName $currentSurah:$currentVerse"
    val subtitle = if (currentReciterName.isNotBlank()) {
      currentReciterName
    } else {
      currentSurahName
    }
    val album = if (currentSurahArabic.isNotBlank()) {
      "$currentSurahName ($currentSurahArabic)"
    } else {
      currentSurahName
    }

    val metadataBuilder = MediaMetadata.Builder()
      .putString(MediaMetadata.METADATA_KEY_TITLE, title)
      .putString(MediaMetadata.METADATA_KEY_ARTIST, subtitle)
      .putString(MediaMetadata.METADATA_KEY_ALBUM, album)
      .putString(MediaMetadata.METADATA_KEY_DISPLAY_TITLE, title)
      .putString(MediaMetadata.METADATA_KEY_DISPLAY_SUBTITLE, currentSurahName)
    if (currentDurationMs > 0L) {
      metadataBuilder.putLong(MediaMetadata.METADATA_KEY_DURATION, currentDurationMs)
    }
    artworkBitmap?.let { bmp ->
      if (!bmp.isRecycled) {
        metadataBuilder.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, bmp)
      }
    }
    session.setMetadata(metadataBuilder.build())

    val actions = PlaybackState.ACTION_PLAY or
      PlaybackState.ACTION_PAUSE or
      PlaybackState.ACTION_PLAY_PAUSE or
      PlaybackState.ACTION_SKIP_TO_PREVIOUS or
      PlaybackState.ACTION_SKIP_TO_NEXT or
      PlaybackState.ACTION_SEEK_TO or
      PlaybackState.ACTION_STOP

    val state = if (currentIsPlaying) PlaybackState.STATE_PLAYING else PlaybackState.STATE_PAUSED
    val speed = if (currentIsPlaying) currentPlaybackRate else 0f

    val playbackState = PlaybackState.Builder()
      .setActions(actions)
      .setState(state, currentPositionMs, speed, SystemClock.elapsedRealtime())
      .build()
    session.setPlaybackState(playbackState)
  }

  private fun publishNotification() {
    val notification = buildNotification()
    val nm = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
    if (currentIsPlaying || !isForegroundActive) {
      val fgType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
      } else {
        0
      }
      try {
        ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, fgType)
        isForegroundActive = true
      } catch (_: Throwable) {
        nm?.notify(NOTIFICATION_ID, notification)
      }
      if (!currentIsPlaying && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        try {
          ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_DETACH)
          isForegroundActive = false
          nm?.notify(NOTIFICATION_ID, notification)
        } catch (_: Throwable) {}
      }
    } else {
      try {
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_DETACH)
        isForegroundActive = false
      } catch (_: Throwable) {}
      nm?.notify(NOTIFICATION_ID, notification)
    }
  }

  private fun buildNotification(): Notification {
    val contentIntent = PendingIntent.getActivity(
      this,
      100,
      Intent(this, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
      },
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val prevPendingIntent = PendingIntent.getService(
      this,
      101,
      Intent(this, MediaPlaybackService::class.java).setAction(ACTION_PREV),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val playPausePendingIntent = PendingIntent.getService(
      this,
      102,
      Intent(this, MediaPlaybackService::class.java).setAction(ACTION_PLAY_PAUSE),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val nextPendingIntent = PendingIntent.getService(
      this,
      103,
      Intent(this, MediaPlaybackService::class.java).setAction(ACTION_NEXT),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val dismissPendingIntent = PendingIntent.getService(
      this,
      104,
      Intent(this, MediaPlaybackService::class.java).setAction(ACTION_DISMISS),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val playPauseIcon = if (currentIsPlaying) {
      android.R.drawable.ic_media_pause
    } else {
      android.R.drawable.ic_media_play
    }
    val playPauseTitle = if (currentIsPlaying) "Pause" else "Play"

    val title = "$currentSurahName $currentSurah:$currentVerse"
    val text = if (currentReciterName.isNotBlank()) {
      "$currentSurahName · $currentReciterName"
    } else {
      currentSurahName
    }

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }

    builder
      .setSmallIcon(R.drawable.ic_notification_quran)
      .setContentTitle(title)
      .setContentText(text)
      .setSubText("Ayah $currentVerse")
      .setContentIntent(contentIntent)
      .setDeleteIntent(dismissPendingIntent)
      .setOngoing(currentIsPlaying)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setCategory(Notification.CATEGORY_TRANSPORT)
      .addAction(
        Notification.Action.Builder(
          android.R.drawable.ic_media_previous,
          "Previous",
          prevPendingIntent
        ).build()
      )
      .addAction(
        Notification.Action.Builder(
          playPauseIcon,
          playPauseTitle,
          playPausePendingIntent
        ).build()
      )
      .addAction(
        Notification.Action.Builder(
          android.R.drawable.ic_media_next,
          "Next",
          nextPendingIntent
        ).build()
      )

    artworkBitmap?.let { bmp ->
      if (!bmp.isRecycled) {
        builder.setLargeIcon(bmp)
      }
    }

    val mediaStyle = Notification.MediaStyle()
      .setShowActionsInCompactView(0, 1, 2)
    mediaSession?.sessionToken?.let { token ->
      mediaStyle.setMediaSession(token)
    }
    builder.style = mediaStyle

    return builder.build()
  }

  private fun buildQuranMediaArtwork(): Bitmap {
    val size = 512
    val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bmp)

    // Deep emerald gradient inspired by traditional mushaf cover art
    val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      shader = LinearGradient(
        0f, 0f, size.toFloat(), size.toFloat(),
        intArrayOf(0xFF0E4732.toInt(), 0xFF093123.toInt(), 0xFF041C13.toInt()),
        floatArrayOf(0f, 0.55f, 1f),
        Shader.TileMode.CLAMP
      )
    }
    canvas.drawRect(0f, 0f, size.toFloat(), size.toFloat(), bgPaint)

    // Subtle geometric Rub el Hizb watermark rings
    val watermarkPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = 6f
      color = 0x1EE5B94C
    }
    val cx = size / 2f
    val cy = size / 2f
    val outerHalf = size * 0.34f
    val outerRect = RectF(cx - outerHalf, cy - outerHalf, cx + outerHalf, cy + outerHalf)
    canvas.drawRoundRect(outerRect, 22f, 22f, watermarkPaint)
    canvas.save()
    canvas.rotate(45f, cx, cy)
    canvas.drawRoundRect(outerRect, 22f, 22f, watermarkPaint)
    canvas.restore()

    val innerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = 3f
      color = 0x2810C98F
    }
    canvas.drawCircle(cx, cy, size * 0.25f, innerPaint)

    // Center gold calligraphy ("القرآن الكريم")
    val arabicFont = try {
      ResourcesCompat.getFont(this, R.font.amiri)
    } catch (_: Throwable) {
      null
    }
    val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = 0xCCF5E6C4.toInt()
      textAlign = Paint.Align.CENTER
      textSize = 72f
      typeface = arabicFont ?: Typeface.SERIF
    }
    canvas.drawText("القرآن الكريم", cx, cy + 20f, textPaint)

    val subPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = 0xAA10C98F.toInt()
      textAlign = Paint.Align.CENTER
      textSize = 22f
      letterSpacing = 0.16f
      typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
    }
    canvas.drawText("QURAN EXPLORER", cx, cy + 78f, subPaint)

    return bmp
  }
}

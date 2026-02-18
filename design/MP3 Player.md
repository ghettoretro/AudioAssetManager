# AdaptiveEngine: MP3 Player
/**
 * @PATH [design/MP3 Player.md]
 * @REV [20260218-1523]
 * @MODULE [SYSTEM_DOCUMENTATION]
 * @STATUS [DRAFT | ACTIVE | DEPRECATED]
 * @FILETYPE [ADR | CHANGE |SYS | PIR | PRD | RSP | GUIDE | SUPPORT/REFERENCE]
 * @DESC []
 * @CONTROLLED [X]
 * -------------------------------------
 * @TODO_START
 * @TODO_END
 * =====================================*/

**MP3 Player**  
**(Android, personal use)**

playlist
album
artist
genre
image coupled
basic controls
persistent play widget

* Local playback and interface design (no AE integration).  
* Potential future tie-in with AE only if you decide to port UI or asset libraries later.

### **The Technical Landscape**

### **1\. The Playback Engine (The "Easy" Part)**

As of 2026, **Jetpack Media3** (which includes **ExoPlayer**) is the standard. It abstracts most of the low-level codec handling. If you just want to point a player at a URI and hit "play," the implementation is straightforward.

* **Difficulty:** 2/10  
* **Key Tool:** `androidx.media3.exoplayer.ExoPlayer`

### **2\. The Media Session & Background Playback (The "Tedious" Part)**

This is where it gets annoying. To keep music playing when the screen is off or the app is backgrounded, you must implement a **Foreground Service**.

* **MediaSessionService:** You need to link your player to a `MediaSession`. This handles the lock screen controls, notification drawer, and "Media" output switching.  
* **Foreground Service Types:** On modern Android (API 34+), you must explicitly declare the `foregroundServiceType="mediaPlayback"` in your manifest and handle the strict lifecycle requirements to avoid the dreaded `ForegroundServiceDidNotStartInTimeException`.  
* **Difficulty:** 7/10

### **3\. Scoped Storage (The "Platform Friction" Part)**

Since Android 11/13, accessing local files isn't as simple as checking a "read storage" permission.

* **Permissions:** You’ll need to handle the granular `READ_MEDIA_AUDIO` permission.  
* **MediaProvider:** Querying the user's library requires working with the `ContentResolver` to scan the `MediaStore` for metadata (artist, album, duration), which is a synchronous API that you must wrap in an asynchronous layer (like Coroutines/Flow).  
* **Difficulty:** 6/10

---

### **Architectural Overview**

The modern architecture separates the **UI (Activity/Compose)** from the **Playback (Service)**. They communicate via a `MediaController`. This ensures that if the UI is destroyed to save memory, the music keeps playing.

### **The Verdict**

If you are doing this as a hobby project to learn the modern Android stack:

* **Go for it.** Using Jetpack Compose with Media3 is a rewarding way to see how the system handles complex service-to-UI communication.  
* **Avoid:** Don't try to use the legacy `MediaPlayer` or `MediaSessionCompat` libraries unless you enjoy self-flagellation. They are deprecated and lack the robustness of Media3.

[Building a Music Player with Media3 and Jetpack Compose](https://www.youtube.com/watch?v=ZTLNSN2umjs) This video is relevant because it covers the 2025/2026 standard for using Media3 and Compose, which is the current "best practice" for avoiding the manual service boilerplate that usually makes developers quit.

When you're ready to start exploring, here are a few key things to look into for building a music player:

* **Development Environment:** You'll want to download **Android Studio**. It's the official, all-in-one tool for building Android apps.  
* **Programming Language:** **Kotlin** is the modern, recommended language for Android development. It's generally considered more concise and safer than the older alternative, Java.  
* **Core Components:** For the music playback functionality itself, you'll likely work with Android's `MediaPlayer` class or, for more advanced features, the `ExoPlayer` library, which is now the recommended choice for most media apps.

### **Your First Steps**

Here is a simple, actionable plan to get you started once you have Android Studio installed:

1. **Follow the "First App" Tutorial:** Don't try to build the music player on day one. Your first goal is just to get comfortable with the tools. Google provides an official tutorial for building your very first, simple app. This will teach you how to create a project, work with the interface, and run the app.  
   * **Official Guide:** [**Create your first Android app**](https://developer.android.com/codelabs/basic-android-kotlin-compose-first-app)  
2. **Learn Kotlin Basics:** While you're playing with Android Studio, spend a little time learning the fundamental syntax of Kotlin. You don't need to be an expert, but understanding variables, functions, and basic logic will make a huge difference.  
   * **Google's Kotlin Course:** [**Android Basics: Introduction to Kotlin**](https://developer.android.com/courses/pathways/android-development-with-kotlin-1)

**The Strategic "Creator Pack" Tool (The Better Path)** Let's reframe "music player" as an **"Audio Asset Manager."** Now it's not a distraction; it's a powerful, integrated tool for your **Creator Pack**.

* **What it does:** Instead of playing music for fun, it's a professional tool for managing audio files for content creation. Users can upload background music tracks, sound effects, or podcast audio files.  
* **How it integrates:**  
  * It lives inside the `Content` or `Curate` module.  
  * The "player" is used to preview audio clips.  
  * When you're in the `Content` workbench building a YouTube video, you could directly pull in an approved background track from this audio library, just like you'd pull in an image.  
  * `Cortex` could even automate adding intro/outro music to generated voiceovers.

**My Recommendation:** Avoid building a generic music player (Path A). Instead, build an **Audio Asset Manager** (Path B). It directly serves a core user (the Creator), deepens the value of an existing product pack, and turns a "nice to have" into a defensible, strategic feature.

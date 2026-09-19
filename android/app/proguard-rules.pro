# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# 1. Preserver les annotations et le pont Javascript pour Capacitor / WebView
-keepattributes *Annotation*
-keepattributes JavascriptInterface

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 2. Preserver les plugins et le core Capacitor (Zaphir)
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.BridgePlugin { *; }

# 3. Plugins Cordova
-keep public class org.apache.cordova.** { *; }

# 4. Bibliothèques réseau & utilitaires
-dontwarn okhttp3.**
-dontwarn okio.**


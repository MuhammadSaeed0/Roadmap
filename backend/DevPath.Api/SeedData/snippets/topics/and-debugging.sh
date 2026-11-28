# Devices and installs
adb devices                                   # list connected devices and emulators
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Logs: only this app, warnings and above
adb logcat --pid=$(adb shell pidof -s com.example.notes) *:W

# Reproduce bugs
adb shell am start -n com.example.notes/.MainActivity
adb shell cmd uimode night yes               # switch the device to dark mode
adb shell am kill com.example.notes          # simulate process death (app in background)

# Evidence for a bug report
adb exec-out screencap -p > screen.png
adb shell screenrecord /sdcard/bug.mp4       # Ctrl+C to stop, then:
adb pull /sdcard/bug.mp4

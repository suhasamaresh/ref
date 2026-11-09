# Manual Test Protocol: Offline Functionality & Low-End Device Performance

This protocol produces the data needed for the "Offline Functionality" subsection
and the low-end device performance claims in the Discussion section. Unlike the
backend and OCR benchmarks, this cannot be automated from a server — it requires
the Expo app running on an actual (or emulated) Android device.

## Equipment needed
- An Android phone with about 2GB RAM
- The app running via `expo start` and Expo Go, or a built APK

## Test 1: Cold start & memory footprint
1. Fully close the app.
2. Open the app and time from tap to interactive Dashboard screen, five runs.
3. While the app is open and idle, check memory usage via Android Settings or `adb shell dumpsys meminfo`.
4. Record five readings.

## Test 2: Offline chat caching
1. With network on, send 3 chat messages and let them complete.
2. Enable Airplane Mode.
3. Re-open the chat screen and note whether the previous messages are still visible.
4. Attempt to send a new message while offline and record the behavior.
5. Disable Airplane Mode and note whether the queued message sends automatically.

## Test 3: Offline resource listings
1. With network on, open the Resources tab and let the list load fully.
2. Enable Airplane Mode, force-close and reopen the app.
3. Open the Resources tab again and record whether the previously-loaded resources still display.

## Test 4: On-device OCR (offline document scan)
1. Enable Airplane Mode.
2. Go to Document Upload and capture a photo of a sample ID-style document.
3. Record whether OCR text extraction completes without network.
4. Record the extracted text and compare manually to the document content.

## Test 5: Reconnection sync
1. After Tests 2–4, disable Airplane Mode.
2. Time how long until queued chat messages send, resource listings refresh, and queued document validation completes.

## Reporting template

| Test | Device | Result | Notes |
|------|--------|--------|-------|
| Cold start time (mean of 5) | | __ s | |
| Idle memory usage (mean of 5) | | __ MB | |
| Offline chat: history visible | | Y/N | |
| Offline chat: queued send time after reconnect | | __ s | |
| Offline resources: items visible | | __/__ | |
| Offline OCR: completes without network | | Y/N | |
| Offline OCR: field accuracy | | __ % | |
| Full reconnect sync time | | __ s | |

Run this on at least 2 different low-end devices if possible.

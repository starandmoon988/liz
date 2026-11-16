# Word Lab change and quality rules

- The supported user-facing product is the original root `index.html`. Keep its layout, original quiz flow, and existing storage keys unless the user specifically asks to change them. Do not replace it with the experimental `next/` interface.
- Screenshot recognition extracts source English headwords only. Do not autocomplete, invent words, join fragments, or silently substitute dictionary spellings.
- Confidence is not proof. Require source position and cross-pass agreement before automatic import. Withhold uncertain OCR; preserve the previous editor contents on failure or empty recognition.
- Do not blacklist legitimate vocabulary such as `set` and `us` merely because they appeared as false positives in another image.
- Test changes before promoting them to root. Stage a candidate under `tests/` when a real browser is required. Do not call deployment or syntax checks alone product acceptance.
- For OCR changes, run the domain tests and actual OCR browser cases, including clean vocabulary, UI noise, genuine short words, dark mode, and an empty image. Clearly distinguish synthetic fixtures from user-provided original images. Record false positives and missing words separately.
- Test screenshot enlargement, zoom, clicking the enlarged image to close, Esc, and preservation of the current editor contents. Run original quiz regressions when changing shared page scripts.
- Fix observed failures and repeat the affected checks. Report any missing original-image or device coverage honestly. Never claim zero OCR errors on untested screenshots.
- Keep a short QA record with the candidate/production revision, checks, results and limits. User feedback is a bug report, not a substitute for developer testing.

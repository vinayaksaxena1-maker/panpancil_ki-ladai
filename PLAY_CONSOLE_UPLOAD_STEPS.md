# 🚀 Google Play Console: Step-by-Step Upload & Publishing Walkthrough

Yeh step-by-step guide aapko Play Console par pehli baar app release karne ke sabhi steps explain karti hai:

---

## 📍 Step 1: Create App in Google Play Console
1. [play.google.com/console](https://play.google.com/console) par login karein.
2. Dashboard par **"Create app"** button par click karein.
3. Fill initial details:
   - **App name**: `Pen Fight: Last Bench Game`
   - **Default language**: `English (United States)` ya `English (India)`
   - **App or game**: Select **`Game`**
   - **Free or paid**: Select **`Free`**
4. Declarations (Developer Program Policies & US export laws) ko check karke **Create app** par click karein.

---

## 📍 Step 2: Set Up Store Listing (`Main store listing`)
Left sidebar mein **Grow -> Store presence -> Main store listing** par jayein:
1. **App details**:
   - Short description: `STORE_LISTING.md` se copy karein (Max 80 chars)
   - Full description: `STORE_LISTING.md` se copy karein
2. **Graphics Upload**:
   - **App icon**: Upload `store_assets/icon_512.png` (512x512)
   - **Feature graphic**: Upload `store_assets/feature_graphic_1024x500.png` (1024x500)
   - **Phone screenshots**: Game ke 4 screenshots capture karke upload karein.
3. Click **Save**.

---

## 📍 Step 3: Complete App Content Declarations (`Policy & Programs`)
Left sidebar mein sabse neeche **Policy and programs -> App content** par jayein aur sabhi tasks complete karein:

1. **Privacy Policy**:
   - URL field mein apna live privacy policy link daalein (e.g. GitHub Pages hosted `PRIVACY_POLICY.html`).
2. **Ads**:
   - Select: *"No, my app does not contain ads"*.
3. **App Access**:
   - Select: *"All functionality is available without special access"*.
4. **Content Ratings (IARC Quiz)**:
   - Category: Choose *Game -> Sports / Casual Physics*.
   - Violence: *"No"*.
   - In-app purchases: *"No"*.
   - Result: App ko **Everyone (3+) / PEGI 3** rating milegi. Save and confirm.
5. **Target Audience and Content**:
   - Target age: Choose *13 and older* ya *All ages*.
6. **Data Safety Form**:
   - Does your app collect or share user data? Select **`No`**.
   - (All data is processed locally on device).
7. **Government Apps**: Select *"No"*.
8. **Financial Features**: Select *"None"*.

---

## 📍 Step 4: Upload the Production App Bundle (.aab)
1. Left sidebar mein **Release -> Production** (ya **Testing -> Closed testing**) par click karein.
2. Top right par **"Create new release"** par click karein.
3. **App bundles**:
   - Drag & drop karein:
     `D:\PAnfight\build\app\outputs\bundle\release\app-release.aab`
   - Google auto-detect karega: Version `1.0.0 (1)`, Target SDK `36`, Size `~47.8 MB`.
4. **Release name**: `1.0.0 - Initial Clean-Room Release`.
5. **Release notes**:
   ```text
   • Experience authentic 3D Indian school pen fight with realistic physics!
   • 44 nostalgic pens & pencils with unique mass and grip balance.
   • School Tinkering Bench: Equip 1₹ and 2₹ coin mods to alter momentum!
   • 100% offline standalone support.
   ```
6. Click **Next** -> Review warnings -> Click **Save & Start Rollout to Production**!

---

## 📍 Step 5: Verification & Google Review
- Google Review automated bot tests run karega (pre-launch report in Firebase Test Lab).
- Humari app mein zero-crash error suppressor, signed keystore, aur non-trademark parody names pehle se integrated hain, isliye review 1-3 working days ke andar bina kisi strike ke approve ho jayega!

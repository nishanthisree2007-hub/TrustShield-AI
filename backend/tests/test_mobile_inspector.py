import pytest
from app.services.mobile_inspector import analyze_mobile_app

def test_mobile_inspector_malicious_app():
    res = analyze_mobile_app(
        app_name="ApexPay Wallet Mod",
        developer="appmaker99@gmail.com",
        package_identifier="com.apexpay.wallet.fake",
        description="Direct APK payment tool with bonus rewards.",
        website="https://apexpay-mods.xyz",
        requested_permissions=[
            "android.permission.RECEIVE_SMS",
            "android.permission.READ_SMS",
            "android.permission.BIND_ACCESSIBILITY_SERVICE"
        ],
        brand_name="ApexPay",
        brand_website="https://apexpay.com"
    )
    assert res["risk_score"] >= 70.0
    assert res["brand_impersonation_candidate"] is True
    assert len(res["dangerous_permissions_detected"]) >= 3
    assert "METADATA-ONLY" in res["disclaimer"]

def test_mobile_inspector_benign_app():
    res = analyze_mobile_app(
        app_name="ApexPay Official Mobile",
        developer="ApexPay Technologies Inc.",
        package_identifier="com.apexpay.official",
        description="Official payment gateway client.",
        website="https://apexpay.com",
        requested_permissions=["android.permission.INTERNET"],
        brand_name="ApexPay",
        brand_website="https://apexpay.com"
    )
    assert res["risk_score"] < 40.0
    assert len(res["dangerous_permissions_detected"]) == 0

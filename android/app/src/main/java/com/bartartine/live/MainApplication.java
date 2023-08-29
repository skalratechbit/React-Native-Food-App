package com.bartartine.live;

import android.app.Application;

import com.crashlytics.android.Crashlytics;
import com.facebook.react.ReactApplication;
import com.horcrux.svg.SvgPackage;
import com.mackentoch.beaconsandroid.BeaconsAndroidPackage;
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.reactnativecommunity.geolocation.GeolocationPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.codemotionapps.reactnativedarkmode.DarkModePackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.masteratul.RNAppstoreVersionCheckerPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import org.reactnative.camera.RNCameraPackage;
import com.imagepicker.ImagePickerPackage;
import com.apsl.versionnumber.RNVersionNumberPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.reactlibrary.RNBluetoothInfoPackage;
// import com.mackentoch.beaconsandroid.BeaconsAndroidPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.lynxit.contactswrapper.ContactsWrapperPackage;
// import com.facebook.react.BuildConfig; // Uncomment in release
import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.react.bridge.JavaScriptExecutorFactory;
import androidx.multidex.MultiDexApplication;
import io.fabric.sdk.android.Fabric;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends MultiDexApplication implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new SvgPackage(),
            new BeaconsAndroidPackage(),
            new RNDateTimePickerPackage(),
            new RNCWebViewPackage(),
            new ReanimatedPackage(),
            new RNGestureHandlerPackage(),
            new GeolocationPackage(),
            new NetInfoPackage(),
            new DarkModePackage(),
            new AsyncStoragePackage(),
          new ReactNativeExceptionHandlerPackage(),
          new RNCameraPackage(),
          new ReactNativeConfigPackage(),
          new RNAppstoreVersionCheckerPackage(),
          new RNFirebasePackage(),
          new RNFirebaseMessagingPackage(),
          new RNFirebaseNotificationsPackage(),
          new ImagePickerPackage(),
          new RNVersionNumberPackage(),
          new RNFetchBlobPackage(),
          new FBSDKPackage(),
          new RNBluetoothInfoPackage(),
          // new BeaconsAndroidPackage(),
          new ReactNativeContacts(),
          new RNDeviceInfo(),
          new ContactsWrapperPackage(),
          new RNPermissionsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fabric.with(this, new Crashlytics());
    SoLoader.init(this, /* native exopackage */ false);

  }
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
//itbApps_2016!
//<key>NSAllowsArbitraryLoadsInWebContent</key>
//<true/>
//<key>NSAllowsLocalNetworking</key>
//<true/>
//Rd@app!2016

#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTPushNotificationManager.h>
@import UserNotifications;
#import <RNFirebaseMessaging.h>
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>
#import <asl.h>
#import <React/RCTLog.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
@implementation AppDelegate - (BOOL) application:(UIApplication *)
     application didFinishLaunchingWithOptions:(NSDictionary *) launchOptions
{
  NSURL *jsCodeLocation;

#ifdef DEBUG
  jsCodeLocation =[NSURL URLWithString:@"http://localhost:8081/index.bundle?platform=ios&dev=true"];
  // jsCodeLocation = [NSURL URLWithString:@"http://192.168.1.60:8081/index.bundle?platform=ios&dev=true"];

#else
jsCodeLocation =[[NSBundle mainBundle] URLForResource: @"main" withExtension:@"jsbundle"];
#endif

RCTRootView *rootView =[[RCTRootView alloc] initWithBundleURL: jsCodeLocation moduleName: @"Roadster" initialProperties: nil launchOptions:launchOptions];
rootView.backgroundColor =[[UIColor alloc] initWithRed: 1.0f green: 1.0f blue: 1.0f alpha:1];

//=========> White flash at launch fix
UIImage *image =[UIImage imageNamed:@"launchscreen_img"];
  if (image)
    {
    UIImageView *launchView =[[UIImageView alloc] initWithImage:image];
    [launchView setFrame:[[UIScreen mainScreen] bounds]];
      rootView.contentMode = UIViewContentModeScaleAspectFill;
      launchView.contentMode = UIViewContentModeScaleAspectFill;
      launchView.image = image;
      rootView.loadingView = launchView;
    }
if (@available(iOS 14, *)) {
    UIDatePicker *picker = [UIDatePicker appearance];
    picker.preferredDatePickerStyle = UIDatePickerStyleWheels;
}    
//=========> /White flash at launch fix

[[FBSDKApplicationDelegate sharedInstance] application: application didFinishLaunchingWithOptions:launchOptions];
  [FIRApp configure];
self.window =[[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController =[UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];



[[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];
[Fabric with:@[[Crashlytics class]]];
  RCTSetLogThreshold (RCTLogLevelInfo);
  RCTSetLogFunction (CrashlyticsReactLogFunction);

  return YES;
}

// Required to register for notifications
-(void) application:(UIApplication *)
     application
       didRegisterUserNotificationSettings:(UIUserNotificationSettings *)
  notificationSettings
{
[RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}

 // Required for the register event.
-(void) application:(UIApplication *)
     application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)
  deviceToken
{
[RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

 // Required for the notification event. You must call the completion handler after handling the remote notification.
-(void) application:(UIApplication *)
     application didReceiveRemoteNotification:(NSDictionary *) userInfo
  fetchCompletionHandler:(void (^)(UIBackgroundFetchResult)) completionHandler
{
[RCTPushNotificationManager didReceiveRemoteNotification: userInfo fetchCompletionHandler:completionHandler];
}

 // Required for the registrationError event.
-(void) application:(UIApplication *)
     application didFailToRegisterForRemoteNotificationsWithError:(NSError *)
  error
{
[RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}

 // Required for the localNotification event.
-(void) application:(UIApplication *)
     application didReceiveLocalNotification:(UILocalNotification *)
  notification
{
[RCTPushNotificationManager didReceiveLocalNotification:notification];
}

-(BOOL) application: (UIApplication *) application openURL: (NSURL *) url options:(NSDictionary < UIApplicationOpenURLOptionsKey,
 id >
 *)options
{

BOOL handled =[[FBSDKApplicationDelegate sharedInstance] application: application openURL: url sourceApplication: options[UIApplicationOpenURLOptionsSourceApplicationKey] annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];

  return handled;
}

RCTLogFunction CrashlyticsReactLogFunction = ^(RCTLogLevel level,
					       __unused RCTLogSource source,
					       NSString * fileName,
					       NSNumber * lineNumber,
					       NSString * message) {
  NSString * log =
    RCTFormatLog ([NSDate date], level, fileName, lineNumber, message);

#ifdef DEBUG
  fprintf (stderr, "%s\n", log.UTF8String);
  fflush (stderr);
#else
  CLS_LOG (@"REACT LOG: %s", log.UTF8String);
#endif

  int aslLevel;
  switch (level)
    {
    case RCTLogLevelTrace:
      aslLevel = ASL_LEVEL_DEBUG;
      break;
    case RCTLogLevelInfo:
      aslLevel = ASL_LEVEL_NOTICE;
      break;
    case RCTLogLevelWarning:
      aslLevel = ASL_LEVEL_WARNING;
      break;
    case RCTLogLevelError:
      aslLevel = ASL_LEVEL_ERR;
      break;
    case RCTLogLevelFatal:
      aslLevel = ASL_LEVEL_CRIT;
      break;
    }
  asl_log (NULL, NULL, aslLevel, "%s", message.UTF8String);


};

@end

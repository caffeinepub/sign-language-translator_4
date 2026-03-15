import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type TranslationRecord = {
    id : Nat;
    mode : Text; // "sign-to-language" or "language-to-sign"
    inputContent : Text;
    outputContent : Text;
    signLanguage : Text;
    spokenLanguage : Text;
    timestamp : Int;
  };

  module TranslationRecord {
    public func compareByTimestampAsc(a : TranslationRecord, b : TranslationRecord) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type UserPreferences = {
    preferredSignLanguage : Text;
    preferredSpokenLanguage : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  let translationRecords = Map.empty<Principal, List.List<TranslationRecord>>();
  let userPreferences = Map.empty<Principal, UserPreferences>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextRecordId = 1;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addTranslationRecord(
    mode : Text,
    inputContent : Text,
    outputContent : Text,
    signLanguage : Text,
    spokenLanguage : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add translation records");
    };

    let record : TranslationRecord = {
      id = nextRecordId;
      mode;
      inputContent;
      outputContent;
      signLanguage;
      spokenLanguage;
      timestamp = Time.now();
    };

    let existingRecords = switch (translationRecords.get(caller)) {
      case (null) { List.empty<TranslationRecord>() };
      case (?records) { records };
    };

    existingRecords.add(record);
    translationRecords.add(caller, existingRecords);
    nextRecordId += 1;
    record.id;
  };

  public query ({ caller }) func getTranslationHistory() : async [TranslationRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access translation history");
    };

    switch (translationRecords.get(caller)) {
      case (null) { [] };
      case (?records) {
        let history = records.toArray().sort(
          TranslationRecord.compareByTimestampAsc
        ).sliceToArray(0, 50);
        history;
      };
    };
  };

  public shared ({ caller }) func clearTranslationHistory() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear translation history");
    };

    translationRecords.remove(caller);
  };

  public shared ({ caller }) func setUserPreferences(
    preferredSignLanguage : Text,
    preferredSpokenLanguage : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set preferences");
    };

    let prefs : UserPreferences = {
      preferredSignLanguage;
      preferredSpokenLanguage;
    };
    userPreferences.add(caller, prefs);
  };

  public query ({ caller }) func getUserPreferences() : async UserPreferences {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access preferences");
    };

    switch (userPreferences.get(caller)) {
      case (null) {
        {
          preferredSignLanguage = "ASL";
          preferredSpokenLanguage = "English";
        };
      };
      case (?prefs) { prefs };
    };
  };
};

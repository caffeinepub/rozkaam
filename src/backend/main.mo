import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Types
  type UserRole = { #customer; #labour };

  type User = {
    id : Text;
    principal : Principal;
    role : UserRole;
    createdTime : Int;
  };

  type Labour = {
    id : Text;
    principal : Principal;
    name : Text;
    phone : Text;
    skill : Text;
    area : Text;
    wage : Nat;
    available : Bool;
    rating : Nat;
    createdTime : Int;
  };

  public type UserProfile = {
    role : UserRole;
    name : ?Text;
    phone : ?Text;
  };

  // System state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, User>();
  let labours = Map.empty<Principal, Labour>();

  // Register user and select role - requires authentication
  public shared ({ caller }) func registerUser(role : UserRole) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register");
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };

    let principal = caller;
    let id = principal.toText();

    let user : User = {
      id;
      principal;
      role;
      createdTime = Time.now();
    };

    users.add(principal, user);
  };

  // Register or update labour profile - only for Labour role users
  public shared ({ caller }) func updateLabourProfile(name : Text, phone : Text, skill : Text, area : Text, wage : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update labour profiles");
    };

    // Verify user has Labour role
    switch (users.get(caller)) {
      case (?user) {
        switch (user.role) {
          case (#labour) {
            // Authorized - proceed
          };
          case (#customer) {
            Runtime.trap("Unauthorized: Only Labour users can create/update labour profiles");
          };
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User must register first with Labour role");
      };
    };

    let principal = caller;
    let id = principal.toText();

    let profile : Labour = {
      id;
      principal;
      name;
      phone;
      skill;
      area;
      wage;
      available = true;
      rating = 5;
      createdTime = Time.now();
    };

    labours.add(principal, profile);
  };

  // Set labour availability - only for Labour users with existing profiles
  public shared ({ caller }) func setLabourAvailability(isAvailable : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update availability");
    };

    // Verify user has Labour role
    switch (users.get(caller)) {
      case (?user) {
        switch (user.role) {
          case (#labour) {
            // Authorized - proceed
          };
          case (#customer) {
            Runtime.trap("Unauthorized: Only Labour users can update availability");
          };
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: User must register first");
      };
    };

    switch (labours.get(caller)) {
      case (?labour) {
        let updatedLabour = { labour with available = isAvailable };
        labours.add(caller, updatedLabour);
      };
      case (null) { Runtime.trap("Labour profile not found for caller") };
    };
  };

  // Get available labour profiles filtered by skill and area - authenticated users only
  public query ({ caller }) func getLaboursBySkillAndArea(skill : Text, area : Text) : async [Labour] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search for labours");
    };

    let allLabours = labours.values().toArray();
    let matches = allLabours.filter(
      func(labour : Labour) : Bool {
        labour.available and
        (skill == "" or labour.skill.contains(#text skill)) and
        (area == "" or labour.area.contains(#text area))
      }
    );
    matches;
  };

  // Get current user's Labour profile - authenticated users only
  public query ({ caller }) func getMyLabourProfile() : async ?Labour {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };

    labours.get(caller);
  };

  // Get user info - only caller can view their own info, or admins can view any
  public query ({ caller }) func getUserInfo(user : Principal) : async ?User {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own user info");
    };

    users.get(user);
  };

  // UserProfile management functions required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    switch (users.get(caller)) {
      case (?user) {
        let labourProfile = labours.get(caller);
        switch (labourProfile) {
          case (?labour) {
            ?{
              role = user.role;
              name = ?labour.name;
              phone = ?labour.phone;
            };
          };
          case (null) {
            ?{
              role = user.role;
              name = null;
              phone = null;
            };
          };
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (users.get(user)) {
      case (?userRecord) {
        let labourProfile = labours.get(user);
        switch (labourProfile) {
          case (?labour) {
            ?{
              role = userRecord.role;
              name = ?labour.name;
              phone = ?labour.phone;
            };
          };
          case (null) {
            ?{
              role = userRecord.role;
              name = null;
              phone = null;
            };
          };
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    // Update or create user record with role
    let id = caller.toText();
    let user : User = {
      id;
      principal = caller;
      role = profile.role;
      createdTime = Time.now();
    };
    users.add(caller, user);

    // If Labour role and profile has name/phone, update labour profile
    switch (profile.role) {
      case (#labour) {
        switch (profile.name, profile.phone) {
          case (?name, ?phone) {
            // Update labour profile if it exists, otherwise create minimal one
            switch (labours.get(caller)) {
              case (?existingLabour) {
                let updatedLabour = {
                  existingLabour with
                  name = name;
                  phone = phone;
                };
                labours.add(caller, updatedLabour);
              };
              case (null) {
                // Create minimal labour profile
                let labour : Labour = {
                  id;
                  principal = caller;
                  name;
                  phone;
                  skill = "";
                  area = "";
                  wage = 0;
                  available = false;
                  rating = 5;
                  createdTime = Time.now();
                };
                labours.add(caller, labour);
              };
            };
          };
          case (_, _) {
            // Name or phone missing, don't update labour profile
          };
        };
      };
      case (#customer) {
        // Customer role doesn't need labour profile
      };
    };
  };
};

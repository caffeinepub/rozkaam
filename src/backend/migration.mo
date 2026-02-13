import Map "mo:core/Map";

module {
  type OldLabour = {
    name : Text;
    phone : Text;
    skill : Text;
    area : Text;
    wage : Nat;
    created_time : Int;
  };

  type OldActor = {
    labours : [OldLabour];
  };

  type NewActor = {
    users : Map.Map<Principal, { id : Text; principal : Principal; role : { #customer; #labour }; createdTime : Int }>;
    labours : Map.Map<Principal, { id : Text; principal : Principal; name : Text; phone : Text; skill : Text; area : Text; wage : Nat; available : Bool; rating : Nat; createdTime : Int }>;
  };

  public func run(_old : OldActor) : NewActor {
    { users = Map.empty(); labours = Map.empty() };
  };
};

export interface TenantCreatedEvent {
  name: "tenant/created";
  data: {
    tenantId: string;
    ownerUserId: string;
    ownerEmail: string;
    organizationName: string;
  };
}

export interface UserInvitedEvent {
  name: "user/invited";
  data: {
    tenantId: string;
    organizationName: string;
    inviteId: string;
    email: string;
    invitedByUserId: string;
    /** Raw (unhashed) invite token, carried only in-transit for the email link — never persisted in plaintext. */
    token: string;
  };
}

export interface UserInviteAcceptedEvent {
  name: "user/invite.accepted";
  data: {
    tenantId: string;
    userId: string;
    inviteId: string;
  };
}

export type DomainEvent =
  | TenantCreatedEvent
  | UserInvitedEvent
  | UserInviteAcceptedEvent;

export type EventName = DomainEvent["name"];

export type EventDataFor<N extends EventName> = Extract<
  DomainEvent,
  { name: N }
>["data"];

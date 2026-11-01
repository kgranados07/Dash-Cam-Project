drop table if exists events; -- if there's existing table (data), then remove it

create table events (
    id integer primary key AUTOINCREMENT,
    user_id integer,
    event_type text,
    street_loc text
);

create table tickets(
    id integer primary key AUTOINCREMENT,
    user_id integer,
    violation text,
    street_loc text,
    price real
);

insert into events(id, user_id, event_type, street_loc)
values (1, 456, 'SPEED', 'Getty Square, Yonkers, NY');


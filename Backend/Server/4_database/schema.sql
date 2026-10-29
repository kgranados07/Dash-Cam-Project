drop table if exists events; -- if there's existing table (data), then remove it

-- create table orders (
--     id integer primary key AUTOINCREMENT, 
--     product text, -- attribute name | attribute data type
--     quantity integer,
--     price real
-- );

-- insert fixed seed data
-- customer1
-- insert into orders(id, product, quantity, price)
-- values (1, 'Laptop', 1, 1200.00);

-- -- customer2
-- insert into orders(id, product, quantity, price)
-- values (2, 'Mouse', 2, 25.50);

-- -- customer3
-- insert into orders(id, product, quantity, price)
-- values (3, 'Keyboard', 1, 75.00);

create table events (
    id integer primary key AUTOINCREMENT,
    user_id integer,
    event_type text,
    street_loc text
);

-- example event
-- example event

insert into events(id, user_id, event_type, street_loc)
values (1, 456, 'SPEED', 'Getty Square, Yonkers, NY');


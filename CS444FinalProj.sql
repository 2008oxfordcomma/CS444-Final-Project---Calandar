create database Calander;

use Calander;

create table person(
	person_id int auto_increment primary key,
    star_id varchar(8) not null,
    first_name varchar(50)
);

create table administrator(
	person_id int primary key,
    foreign key(person_id) references person(person_id)
);

create table class(
	class_id int auto_increment primary key,
    class_name varchar(128)
);


create table takes(
	person_id int not null,
    class_id int not null,
    primary key(person_id, class_id),
    foreign key(person_id) references person(person_id),
    foreign key(class_id) references class(class_id)
);

create table task(
	task_id int auto_increment primary key,
    task_type enum ('Discussion', 'Quiz', 'Assignment', 'Other') not null,
    due_date datetime not null,
    complete bool,
    class_id int not null,
	person_id int not null,
    foreign key(class_id) references class(class_id),
    foreign key(person_id) references person(person_id)
);


    
    
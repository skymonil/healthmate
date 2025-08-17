#!/bin/bash

cd client
npm run dev &

cd ../server
mvn spring-boot:run &
from kafka import KafkaProducer
import json

producer=KafkaProducer(
  bootstrap_servers="localhost:9092",
  value_serializer=lamba x:
json.dumps(x).encode()
)

event={
  "user":"sai",
  "event":"login",
  "status":"success"
}

producer.send(
  "identity-events",
  event
)

producer.close()

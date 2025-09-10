# Pubsub

Pubsub is a 1-reader 1-writer data structure, which allows a single producers to
dispatch data and a single consumer to consume them. Only the last dispatched
value is stored and writer needs to wait for the reader to prevent data loss.

# Make Protobuf 

This action is used to update protobufs for swift code

The directory parameter should be set to the place where the mprc files are downloaded
It is optional and defaults to "mrpc"

```yaml
- uses: lismondbernard/actions/make-protos@v1
      with:
          directory: "mrpc"
```

## Developing

This code is composite actions based mostly on bash scripts.

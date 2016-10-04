# web-model
Model layer in front end's mv* pattern.

## description

As front end projects run independently nowadays, a model wrapper for backend's api service seems necessary.
It should be easy to use. Features like interceptor, multi sources, cache will be supported. Cool web APIs(web database/web storage/worker) will be used. And it depends on [superagent](https://github.com/visionmedia/superagent) as ajax tool.

## goals

1. Model constructor: 
    [] take the description of a model, generate a instance with async methods attached;
    [] interceptors can be set to Model globally; 
2. Web Storage:
    [] localStorage and sessionStorage support with optional expire time(cookies as fallback?);
3. Web Workers:
    [] use work to execute ajax calls
4. Web Database:
    [] use of Web SQL or indexedDB(for long-term, non-expire kind of data).
5. Maybe more...


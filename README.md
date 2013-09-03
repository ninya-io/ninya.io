# StackWho

####What's the deal?

Ever wanted to discover StackExchange (StackOverflow, Server Fault, Super User etc) users around you that share your interests? StackWho makes it possible to find other StackExchange users near your, sorted by reputation. You can further filter them by tags. ATTENTION: If you are a company and are trying to find new employees, StackExchange offers a paid search that probably match your needs much better. This is not an attempt to compete with them.

####How?

StackExchange does not offer a public search API (they have a paid candidate search though!). That means,
we first have to fetch all their users (actually only the top 20,000) and combine them with their top 30 tags of the answers they have given. We store that information in a CouchDB on heroku. We then use a slim Node.js
backend to serve our client requests.

####Developing

This is more or less an early spike that was built in a very short amount of time.
At this stage it's missing tests, a proper build chain, travis integration etc. pp
Lot's of things are in flux.

However, the code is covered by the MIT license and I'm happy to see people joining forces with me.

####See it in action

http://cburgdorf.github.io/StackWho/src/index.html

--Christoph
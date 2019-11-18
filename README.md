## Search TODOs

A script to retrieve all TODOs in working directory

## Installing

Clone this repo

```
git clone
```


Run NPM install in your directory  

```  
node seed-data.js ./path/to/your/dir 
```

## Usage

Search for all `TODOS` in your file directory asynchronously  

```  
node search-async.js ./path/to/your/dir
```

Search for all `TODOS` in your file directory synchronously  

```  
node search-sync.js ./path/to/your/dir
```

## Tracking performance

Track performance asynchronously  

```  
node search-async.js ./path/to/your/dir performance
```

Track performance synchronously  

```  
node search-sync.js ./path/to/your/dir performance
```

## Running tests

### Asynchronous set-up

Seed test data   

```  
npm run seed   
```

Run test with seed data (async)  

```  
npm run test-async  
```

Run performance test with seed data (async)  

```  
npm run performance-async  
```

### Synchronous set-up

Seed test data

```
npm run seed 
```

Run test with seed data (sync)

```
npm run test-sync
```

Run performance test with seed data (sync)

```
npm run performance-sync
```

### Large data set-up (Caution: this will take some time)

Seed test data 

```
npm run seed-large
```

Run test with seed data (async)

```
npm run test-async-large
```

Run performance test with seed data (async)

```
npm run performance-async-large
```

## Considerations

- nested directories and files
- many open files > file table overflow
- large files
- usability

## Methods

- Built with Node.js
- Used a parallel loop to walk through directories
- Added a max queue size of 200 to prevent table overflow error

## Furthers

- Options to view performance of script (eg. time elapsed, number of files, memory)
- Formatted results for better user experience
- Included a synchronous script to compare performance
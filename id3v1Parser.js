var Transform = require('stream').Transform
  , inherits = require('util').inherits
  , enc = 'ascii';

module.exports = Id3v1Parser;

function Id3v1Parser(){
    if ( !(this instanceof Id3v1Parser) ) 
        return new Id3v1Parser();

    Transform.call(this, { objectMode: true })
}

inherits(Id3v1Parser, Transform);

Id3v1Parser.prototype._transform = function(chunk, enc, done) {
    this._lastChunk = chunk;
    done();
};

Id3v1Parser.prototype._flush = function(done) {
    var chunk = this._lastChunk
      , tags;

    chunk = chunk.slice(chunk.length - 128);

    try {
        tags = Id3v1Parser.parseTags(chunk)

        for(var k in tags) this.push(k, tags[k])
        this.push(null);

    } catch (err){
        this.emit('error', err)
    }

    done();
};


Id3v1Parser.parseTags = function(chunk){
    var off = 0
      , tags = {}
      , err;

    if ( getString(chunk, off, off += 3 ) !== 'TAG' ) {
        err = new Error("Not a valid ID3v1 tag")
        err.type = "AudioInfoNotFoundError"
        throw err
    }

    tags.title = getString(chunk, off, off += 30 )
    tags.artist = getString(chunk, off, off += 30 )
    tags.album = getString(chunk, off, off += 30 )
    tags.year = getString(chunk, off, off += 4  )
    tags.comment= getString(chunk, off, off += 28 )

    tags.track = chunk[off += 1]
    tags.genre = chunk[off += 1]

    return tags;
}

Id3v1Parser.prototype.push = function tag(tag, value){
    if ( arguments.length === 1 && tag === null ) 
        return Transform.prototype.push.call(this, null)

    Transform.prototype.push.call(this, {
        type: tag,  
        value: value  
    });
}

function getString(buf, start, end){
    return buf.toString(enc, start, end).trim().replace(/\x00/g, '')
}


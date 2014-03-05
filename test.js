var chai = require('chai')
    , readStream = require('fs' ).createReadStream
    , Parser = require('./id3v1Parser');

chai.should();

describe ('when streaming an mpeg file to the tag parser', function(){
    var parser;

    beforeEach(function(){
        parser = new Parser();
    })

    it('should correctly parse tags', function(done){
        var tags = {}
        readStream(__dirname + '/ID3Tags.mp3')
            .pipe(parser)
            .on('data', function(tag){
                tag.should.not.be.undefined;
                tag.should.have.property('type');
                tag.should.have.property('value');
                tags[tag.type] = tag.value
            })
            .on('end', function(){
                tags.artist.should.equal('artist')
                tags.title.should.equal('my title')
                tags.album.should.equal('an album')
                tags.genre.should.equal(0)
                tags.year.should.equal('2013')
                tags.track.should.equal(1)
                tags.comment.should.equal('a comment')
                done()
            })
    })

    describe('when the file is invalid', function(){

        beforeEach(function(){
            parser._lastChunk = new Buffer('definitely not an mp3 file')
        })

        it('should throw an error', function(done){

            parser.on('error', function(err){
                err.type.should.equal('AudioInfoNotFoundError')
                done()
            })

            parser._parseTags()
        })
    })
})
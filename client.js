const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './notes.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const notesProto = grpc.loadPackageDefinition(packageDefinition);

const NoteService = notesProto.NoteService;

const client = new NoteService('localhost:50051',
    grpc.credentials.createInsecure());

module.exports = client
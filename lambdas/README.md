# Daily Games Lambda Functions

TypeScript Lambda functions for the Daily Games API.

## Structure

```
src/
├── handlers/          # Lambda handler functions
│   ├── daily-word.ts  # GET /daily-word
│   ├── games.ts       # GET /games
│   ├── group.ts       # GET /group/{name}
│   ├── daily-result.ts # CRUD for /daily-result
│   └── results.ts     # GET /results (CSV export)
├── models/            # TypeScript interfaces
├── parsers/           # Game result parsers (59 games)
├── services/          # DynamoDB client
└── utils/             # Helper functions
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /daily-word | Get today's starting word |
| GET | /games | List all games |
| GET | /group/{name} | Get group info with popularity |
| GET | /daily-result/{dateOrUser} | Get results |
| GET | /daily-result/{user}/{date} | Get user results for date |
| GET | /daily-result/{user}/{date}/{game} | Get specific result |
| PUT | /daily-result/{user} | Submit result for today |
| PUT | /daily-result/{user}/{date} | Submit result for date |
| DELETE | /daily-result/{id} | Delete by ID |
| DELETE | /daily-result/{user} | Delete all for user |
| DELETE | /daily-result/{user}/{date} | Delete user results for date |
| GET | /results | CSV export |

## Supported Games

The API supports 59 games including:
- Wordle, Quordle, Connections, Strands
- NYT Mini, NYT Crossword
- Framed, Actorle, Heardle
- And many more...

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch for changes
npm run watch
```

## Deployment

Lambda functions are deployed via CDK (see infrastructure/ folder).

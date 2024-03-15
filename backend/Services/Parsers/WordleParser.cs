using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class WordleParser : BasicScoreResultParser
    {
        private ILogger<WordleParser> _logger;

        public WordleParser(ILogger<WordleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override bool Default => true;
        public override string GameName => "Wordle";
        public override string? HelpText => "Start with today's random word.";
        protected override Regex Parser => new Regex($"{GameName} .+?(?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => null;
        public override string Url => "https://www.nytimes.com/games/wordle/index.html";
    }
}

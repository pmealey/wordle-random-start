using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class BracketCityParser : BasicScoreResultParser
    {
        private ILogger<BracketCityParser> _logger;

        public BracketCityParser(ILogger<BracketCityParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool GolfScoring => false;
        public override bool CountWinner => true;
        public override string GameName => "Bracket City";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"\\[{GameName}\\].+?Total Score: (?<{ScoreGroup}>\\d+)\\.\\d+", RegexOptions.Singleline);
        protected override string? ExtraContent => null;
        public override string Url => "https://www.theatlantic.com/games/bracket-city";
    }
}

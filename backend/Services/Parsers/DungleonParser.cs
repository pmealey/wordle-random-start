using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class DungleonParser : BasicScoreResultParser
    {
        private ILogger<DungleonParser> _logger;

        public DungleonParser(ILogger<DungleonParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Dungleon";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{Url} #\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => null;
        public override string Url => "https://www.dungleon.com";
        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(Url, GameName).Trim();
        }
    }
}

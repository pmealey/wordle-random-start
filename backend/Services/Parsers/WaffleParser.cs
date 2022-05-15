using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class WaffleParser : BasicScoreResultParser
    {
        private ILogger<WaffleParser> _logger;

        public WaffleParser(ILogger<WaffleParser> logger) : base(logger)
        {
            _logger = logger;
        }
        public override string GameName => "Waffle";
        public override bool GolfScoring => false;
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"#{GameName.ToLower()}\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => "wafflegame.net";
        public override string Url => "https://wafflegame.net/";
    }
}

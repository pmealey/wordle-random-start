using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class ThriceParser : BasicScoreResultParser
    {
        private ILogger<ThriceParser> _logger;

        public ThriceParser(ILogger<ThriceParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Thrice";
        public override bool GolfScoring => false;
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"{GameName} Game #\d+ → (?<{ScoreGroup}>[\d]) points");
        protected override string? ExtraContent => Url;
        public override string Url => "https://thricegame.com";
    }
}

using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class HertlParser : BasicScoreResultParser
    {
        private ILogger<HertlParser> _logger;

        public HertlParser(ILogger<HertlParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Hertl";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"HERTL \(Game #\d+\) - (?<{ScoreGroup}>[\d|X]) / \d");
        protected override string? ExtraContent => Url;
        public override string Url => "https://www.hertl.app";
    }
}

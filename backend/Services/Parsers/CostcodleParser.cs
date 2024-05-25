using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class CostcodleParser : BasicScoreResultParser
    {
        private ILogger<CostcodleParser> _logger;

        public CostcodleParser(ILogger<CostcodleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Costcodle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"{GameName} #\d+ (?<{ScoreGroup}>[\d|X])/\d");
        protected override string? ExtraContent => Url;
        public override string Url => "https://costcodle.com";
    }
}

using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class JuxtastatParser : BasicScoreResultParser
    {
        private ILogger<JuxtastatParser> _logger;

        public JuxtastatParser(ILogger<JuxtastatParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Juxtastat";
        public override bool GolfScoring => false;
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"{GameName} \d+ (?<{ScoreGroup}>[\d|X])/\d");
        protected override string? ExtraContent => null;
        public override string Url => "https://juxtastat.org";
    }
}

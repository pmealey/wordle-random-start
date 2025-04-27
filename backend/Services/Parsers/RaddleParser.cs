using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class RaddleParser : BasicScoreResultParser
    {
        private ILogger<RaddleParser> _logger;

        public RaddleParser(ILogger<RaddleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool GolfScoring => false;
        public override bool CountWinner => true;
        public override string GameName => "Raddle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName.ToUpper()}.+?(?<{ScoreGroup}>\\d+)%", RegexOptions.Singleline);
        protected override string? ExtraContent => null;
        public override string Url => "https://raddle.quest";
    }
}

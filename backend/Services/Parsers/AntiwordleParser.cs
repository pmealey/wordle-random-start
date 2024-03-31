using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class AntiwordleParser : BasicScoreResultParser
    {
        private ILogger<AntiwordleParser> _logger;

        public AntiwordleParser(ILogger<AntiwordleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override string GameName => "Antiwordle";
        public override bool GolfScoring => false;
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName} #\\d+\\s*(?<{ScoreGroup}>\\d+) guesses", RegexOptions.Singleline);
        protected override string? ExtraContent => null;
        public override string Url => "https://www.antiwordle.com/";
    }
}

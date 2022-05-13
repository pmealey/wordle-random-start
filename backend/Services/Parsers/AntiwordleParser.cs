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

        private const string _gameName = "Antiwordle";
        public override string GameName => _gameName;
        public override bool GolfScoring => false;
        private readonly Regex _parser = new Regex($"{_gameName} #\\d+\\s*(?<{ScoreGroup}>\\d+) guesses", RegexOptions.Singleline);
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => null;
        private const string _url = "https://www.antiwordle.com/";
        public override string Url => _url;
    }
}

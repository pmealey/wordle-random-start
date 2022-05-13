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
        private const string _gameName = "Waffle";
        public override string GameName => _gameName;
        public override bool GolfScoring => true;

        private readonly Regex _parser = new Regex($"#{_gameName.ToLower()}\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => null;
        private const string _url = "https://wafflegame.net/";
        public override string Url => _url;
    }
}

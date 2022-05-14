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

        private const string _gameName = "Dungleon";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"{_url} #\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override Regex Parser => _parser;
        protected override string? ExtraContent => null;
        private const string _url = "https://www.dungleon.com";
        public override string Url => _url;
        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(_url, _gameName).Trim();
        }
    }
}

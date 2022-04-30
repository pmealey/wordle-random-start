using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class BoxOfficeGameParser : BasicScoreResultParser
    {
        private ILogger<BoxOfficeGameParser> _logger;

        public BoxOfficeGameParser(ILogger<BoxOfficeGameParser> logger) : base(logger)
        {
            _logger = logger;
        }

        private const int _priority = 9;
        public override int Priority => _priority;
        private const string _gameName = "Box Office Game";
        public override string GameName => _gameName;
        public override bool GolfScoring => false;
        protected override Regex Parser => new Regex($"boxofficega\\.me.*🏆 (?<{ScoreGroup}>[\\d]+)", RegexOptions.Singleline);
        private const string _url = "https://boxofficega.me/";
        public override string Url => _url;
        protected override string? ExtraContent => string.Empty;
        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace("boxofficega.me", "boxofficegame");
        }
    }
}

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

        public override string GameName => "Box Office Game";
        public override bool GolfScoring => false;
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"boxofficega\\.me.*🏆 (?<{ScoreGroup}>[\\d]+)", RegexOptions.Singleline);
        public override string Url => "https://boxofficega.me/";
        protected override string? ExtraContent => string.Empty;
        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace("boxofficega.me", "boxofficegame");
        }
    }
}

using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class MoviemojiParser : BasicScoreResultParser
    {
        private ILogger<MoviemojiParser> _logger;

        public MoviemojiParser(ILogger<MoviemojiParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Moviemoji";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName} #\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => "Play here: ";
        public override string Url => "https://moviedle.xyz/moviemoji/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(ExtraContent, string.Empty).Replace(Url, string.Empty).Trim();
        }
    }
}

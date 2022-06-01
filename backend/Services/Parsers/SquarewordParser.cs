using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class SquarewordParser : BasicScoreResultParser
    {
        private ILogger<SquarewordParser> _logger;

        public SquarewordParser(ILogger<SquarewordParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string Category => "Word";
        public override string GameName => "Squareword";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"{GameName.ToLower()}.org \\d+: (?<{ScoreGroup}>\\d+) guesses");
        protected override string? ExtraContent => "#squareword #squareword121";
        public override string Url => "https://squareword.org/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return base.GetCleanResult(result.Replace($"{GameName.ToLower()}.org", $"{GameName.ToLower()}"), parserResults);
        }
    }
}

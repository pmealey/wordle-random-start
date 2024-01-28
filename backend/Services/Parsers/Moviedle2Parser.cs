using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class Moviedle2Parser : BasicScoreResultParser
    {
        private ILogger<Moviedle2Parser> _logger;

        public Moviedle2Parser(ILogger<Moviedle2Parser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override bool Default => false;
        public override string GameName => "Moviedle 2";
        public override string? HelpText => "Guess a movie based on its similarities with your prior guesses.";
        protected override Regex Parser => new Regex($"Moviedle #\\d+ (?<{ScoreGroup}>[\\d|X])/\\d");
        protected override string? ExtraContent => "Play here: ";
        public override string Url => "https://moviedle.xyz";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace(ExtraContent, string.Empty).Replace(Url, string.Empty).Trim();
        }
    }
}

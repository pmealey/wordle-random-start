using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class SedecordleSaviorParser : BasicScoreResultParser
    {
        private ILogger<SedecordleSaviorParser> _logger;

        public SedecordleSaviorParser(ILogger<SedecordleSaviorParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override bool Default => false;
        public override string GameName => "Sedecordle Savior";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"Daily Savior #\d+\nGuesses: (?<{ScoreGroup}>(\d\d?)|X).*?{ExtraContent}", RegexOptions.Singleline);
        protected override string? ExtraContent => "https://sedecordle.com\n#sedecordle";
        public override string Url => "https://www.sedecordle.com/savior";

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            if (dailyResult.Scores == null)
            {
                return null;
            }

            return "\"" + string.Join(",", Enumerable.Range(0, 16).ToArray()
                .Select((i) => {
                    if (dailyResult.Scores.Count <= i)
                    {
                        return "X";
                    }

                    return dailyResult.Scores[i].ToString();
                })) + "\"";
        }
    }
}

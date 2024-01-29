using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class SedecOrderParser : BasicScoreResultParser
    {
        private ILogger<SedecOrderParser> _logger;

        public SedecOrderParser(ILogger<SedecOrderParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override bool Default => false;
        public override string GameName => "Sedec-order";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"Daily {GameName} #\d+\nGuesses: (?<{ScoreGroup}>(\d\d?)|X).*?{ExtraContent}", RegexOptions.Singleline);
        protected override string? ExtraContent => "https://sedecordle.com\n#sedecordle  #sedecorder";
        public override string Url => "https://www.sedecordle.com/sedec-order";

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

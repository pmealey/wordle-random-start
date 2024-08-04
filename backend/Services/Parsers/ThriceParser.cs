using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class ThriceParser : BasicScoreResultParser
    {
        private ILogger<ThriceParser> _logger;

        public ThriceParser(ILogger<ThriceParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Thrice";
        public override bool GolfScoring => false;
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($@"{GameName} Game #\d+ → ((?<{ScoreGroup}>[\d]+) points|(?<{ScoreGroup}>I got a perfect score on today's Thrice))");
        protected override string? ExtraContent => Url;
        public override string Url => "https://thricegame.com";

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (parserResults.Groups.ContainsKey(ScoreGroup) && parserResults.Groups[ScoreGroup].Value == "I got a perfect score on today's Thrice")
            {
                dailyResult.Score = 15;
            }

            return base.SetScore(dailyResult, parserResults);
        }
    }
}

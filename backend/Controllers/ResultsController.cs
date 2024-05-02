using backend.Data;
using backend.Services;
using backend.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class ResultsController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<ResultsController> _logger;
    private readonly IEnumerable<ResultParser> _resultParsers;
 
    public ResultsController(DataContext context, ILogger<ResultsController> logger, IEnumerable<ResultParser> resultParsers)
    {
        _context = context;
        _logger = logger;
        _resultParsers = resultParsers;
    }

    [HttpGet("{group}/{game}")]
    public IActionResult Get([FromRoute] string group, [FromRoute] string game)
    {
        game = game.ToLower();
        group = group.ToLower();

        if (GroupController.Groups.All(g => g.Name.ToLower() != group))
        {
            return BadRequest("Invalid group");
        }

        if (_resultParsers.All(rp => rp.GameName.ToLower() != game))
        {
            return BadRequest("Invalid game");
        }

        var results = _context.DailyResult.AsQueryable()
            .Where(dr => dr.Game.ToLower() == game)
            .Where(dr => dr.Groups.Any(g => g == group))
            .OrderBy(dr => dr.Date)
            .ThenBy(dr => dr.User)
            .AsEnumerable()
            .Select(dr => new {
                dr.Date,
                dr.User,
                dr.Result
            })
            .ToList();

        return Ok(results);
    }

    [HttpGet()]
    public IActionResult Get([FromQuery] string names, [FromQuery] string exclude, [FromQuery] string? group)
    {
        var excludedGames = exclude.Split(',').Select(e => e.Trim().ToLower());

        names = names.ToLower();
        List<string> users;
        var allUsers = false;
        if (names.ToLower() == "all")
        {
            allUsers = true;
            users = new List<string>();
        }
        else
        {
            users = names.Split("/")
                .Select(u => u.ToLower())
                .ToList();
        }

        if (users.Count == 0)
        {
            return BadRequest();
        }

        var query = _context.DailyResult.AsQueryable();

        if (group != null)
        {
            query = query.Where(dr => dr.Groups.Any(g => g == group.ToLower()));
        }

        if (!allUsers)
        {
            query = query.Where(dr => names.Contains(dr.User.ToLower()));
        }

        var parsers = _resultParsers
            .Where(rp => !excludedGames.Contains(rp.GameName.ToLower()))
            .ToList();

        var dailyResultRows = query
            .OrderBy(dr => dr.Date)
            .ThenBy(dr => dr.User)
            .ThenBy(dr => dr.Game)
            .AsEnumerable()
            .GroupBy(dr => new {
                Date = dr.Date,
                User = dr.User
            })
            .Select(g => {
                var rowParts = new List<string> {
                    g.Key.Date.ToString("MM/dd/yyyy"),
                    g.Key.User
                };

                foreach (var resultParser in parsers)
                {
                    var dailyResult = g.FirstOrDefault(dr => dr.Game == resultParser.GameName);

                    if (dailyResult != null)
                    {
                        rowParts.Add(resultParser.GetScoreValue(dailyResult) ?? string.Empty);
                    }
                    else
                    {
                        rowParts.Add(string.Empty);
                    }
                }

                return string.Join(",", rowParts) + Environment.NewLine;
            })
            .ToList();

        var csvStream = new MemoryStream();
        var csvWriter = new StreamWriter(csvStream);

        var headerParts = new [] { "Date", "Player" }.Concat(parsers.Select(rp => rp.GameName + " Score"));
        csvWriter.Write(string.Join(",", headerParts) + Environment.NewLine);

        foreach (var row in dailyResultRows)
        {
            csvWriter.Write(row);
        }

        csvWriter.Flush();
        csvStream.Seek(0, SeekOrigin.Begin);

        var now = TimeUtility.GetNowEasternStandardTime().ToString("yyyy-MM-dd");
        return File(csvStream, "text/plain", $"Results as of {now}.csv");
    }
}

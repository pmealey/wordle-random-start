using backend.Data;
using backend.Models;
using backend.Services;
using backend.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class DailyResultController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<DailyResultController> _logger;
    private readonly IEnumerable<ResultParser> _resultParsers;

    private readonly IList<string> AcceptedGroups = GroupController.Groups.Select(g => g.Name).ToList();

    public DailyResultController(DataContext context, ILogger<DailyResultController> logger, IEnumerable<ResultParser> resultParsers)
    {
        _context = context;
        _logger = logger;
        _resultParsers = resultParsers;
    }

    [HttpGet("{id:int}")]
    public IActionResult Get([FromRoute] int id)
    {
        var dailyResult = _context.DailyResult.SingleOrDefault(dr => dr.Id == id);

        if (dailyResult == null)
        {
            return NotFound();
        }

        return Ok(dailyResult);
    }

    [HttpGet("{dateOrUser}")]
    public IActionResult GetDailySummary([FromRoute] string dateOrUser, [FromQuery] string[] group)
    {
        var invalidGroups = group.Where((g) => !AcceptedGroups.Contains(g)).ToList();
        if (invalidGroups.Count() > 0)
        {
            if (invalidGroups.Count() > 1)
            {
                return BadRequest(string.Join(", ", invalidGroups.Select((g) => "\"" + g + "\"")) + " are not valid groups.");
            }
            else
            {
                return BadRequest("\"" + invalidGroups.First() + "\" is not a valid group.");
            }
        }

        var query = _context.DailyResult.AsQueryable();

        if (DateTime.TryParse(dateOrUser, out var date))
        {
            query = query.Where(dr => dr.Date.Date == date.Date);
        } 
        else
        {
            query = query.Where(dr => dr.User.ToLower() == dateOrUser.ToLower());
        }

        if (group != null && group.Length > 0)
        {
            query = query.Where(dr => dr.Groups.Any(g => group.Contains(g)));
        }
        else
        {
            query = query = query.Where(dr => dr.Groups.Contains("family"));
        }

        var dailyResults = query
            .OrderBy(dr => dr.Game)
            .ThenBy(dr => dr.Date)
            .ThenBy(dr => dr.User)
            .ToList();

        return Ok(dailyResults);
    }

    [HttpGet("{user}/{dateString}")]
    public IActionResult GetDailySummary([FromRoute] string user, [FromRoute] string dateString)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var dailyResults =
            _context.DailyResult
            .Where(dr => dr.User.ToLower() == user.ToLower() && dr.Date == date.Date)
            .ToList();

        return Ok(dailyResults);
    }

    [HttpGet("{user}/{dateString}/{game}")]
    public IActionResult GetGameResult([FromRoute] string user, [FromRoute] string dateString, [FromRoute] string game)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var dailyResult = _context.DailyResult.SingleOrDefault(dr => dr.User.ToLower() == user.ToLower() && dr.Date == date.Date && dr.Game == game);

        if (dailyResult == null)
        {
            return NotFound();
        }

        return Ok(dailyResult);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete([FromRoute] int id)
    {
        var dailyResult = _context.DailyResult.SingleOrDefault(dr => dr.Id == id);

        if (dailyResult != null)
        {
            _context.DailyResult.Remove(dailyResult);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpDelete("{user}")]
    public IActionResult Delete([FromRoute] string user)
    {
        var dailyResults = _context.DailyResult
            .Where(dr => dr.User.ToLower() == user.ToLower())
            .ToArray();

        if (dailyResults.Length > 0)
        {
            _context.DailyResult.RemoveRange(dailyResults);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpDelete("{user}/{dateString}")]
    public IActionResult Delete([FromRoute] string user, [FromRoute] string dateString)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var dailyResults = _context.DailyResult
            .Where(dr => dr.User.ToLower() == user.ToLower() && dr.Date == date.Date)
            .ToArray();

        if (dailyResults.Length > 0)
        {
            _context.DailyResult.RemoveRange(dailyResults);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpPut("{user}")]
    public IActionResult Set([FromRoute] string user, [FromBody] string result, [FromQuery] List<string> group)
    {
        return CreateDailyResult(user, TimeUtility.GetNowEasternStandardTime().Date, result, group);
    }

    [HttpPut("{user}/{dateString}")]
    public IActionResult Set([FromRoute] string user, [FromRoute] string dateString, [FromBody] string result, [FromQuery] List<string> group)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        return CreateDailyResult(user, date, result, group);
    }

    private IActionResult CreateDailyResult(string user, DateTime date, string result, List<string> groups) {
        var invalidGroups = groups.Where((g) => !AcceptedGroups.Contains(g)).ToList();
        if (invalidGroups.Count() > 0)
        {
            if (invalidGroups.Count() > 1)
            {
                return BadRequest(string.Join(", ", invalidGroups.Select((g) => "\"" + g + "\"")) + " are not valid groups.");
            }
            else
            {
                return BadRequest("\"" + invalidGroups.First() + "\" is not a valid group.");
            }
        }


        DailyResult? dailyResult = null;
        foreach (var parser in _resultParsers)
        {
            if (parser.TryParse(user, date, result, out dailyResult))
            {
                break;
            }
        }

        if (dailyResult == null)
        {
            return BadRequest("The game results could not be parsed.");
        }

        if (groups.Count > 0)
        {
            dailyResult.Groups = groups;
        }
        else
        {
            dailyResult.Groups = new List<string>() { "family" };
        }

        var existingResult = _context.DailyResult.SingleOrDefault(dr => dr.User.ToLower() == dailyResult.User.ToLower() && dr.Date.Date == dailyResult.Date.Date && dr.Game == dailyResult.Game);
        if (existingResult != null)
        {
            _context.Entry(existingResult).State = EntityState.Detached;
            dailyResult.Id = existingResult.Id;
            _context.DailyResult.Attach(dailyResult);
            _context.Entry(dailyResult).State = EntityState.Modified;
        }
        else
        {
            _context.DailyResult.Add(dailyResult);
        }

        _context.SaveChanges();

        return NoContent();
    }
}

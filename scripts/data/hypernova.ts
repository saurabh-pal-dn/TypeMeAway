import { Repo, RepoFile } from "./index";

const files: RepoFile[] = [
  {
    path: "src/utils/renderBatch.js",
    code: `
def _validate_observer_args(initial_obstime, observer, time):
  if (observer is not None) and (time is not None):
    raise ValueError(
      "Either the 'observer' or the 'time' keyword must be specified, "
      "but not both simultaneously."
    )
  elif observer is not None:
    # Check that the new_observer is specified correctly.
    if not (isinstance(observer, (BaseCoordinateFrame, SkyCoord))):
      raise ValueError(
        "The 'observer' must be an astropy.coordinates.BaseCoordinateFrame or an astropy.coordinates.SkyCoord."
      )
    if observer.obstime is None:
      raise ValueError("The observer 'obstime' property must not be None.")
  elif observer is None and time is None:
    raise ValueError(
      "Either the 'observer' or the 'time' keyword must not be None."
    )
  `,
  },
  {
    path: "src/environment.js",
    code: `
@pytest.fixture()
def sunpy_cache(mocker, tmp_path):
  from types import MethodType
  cache = Cache(ParfiveDownloader(), InMemStorage(), tmp_path, None)

  def add(self, url, path):
    self._storage.store(
      {
        "url": url,
        "file_path": path,
        "file_hash": "none",
      }
    )

  cache.add = MethodType(add, cache)
  `,
  },
  {
    path: "src/index.js",
    code: `
def differential_rotate(smap, observer=None, time=None, **diff_rot_kwargs):
  if is_all_off_disk(smap):
    raise ValueError(
      "The entire map is off disk. No data to differentially rotate."
    )

  new_observer = _get_new_observer(smap.date, observer, time)

  from skimage import transform

  # Check whether the input contains the full disk of the Sun
  is_sub_full_disk = not contains_full_disk(smap)
  if is_sub_full_disk:
    if not is_all_on_disk(smap):
      # Get the bottom left and top right coordinates that are the
      bottom_left, top_right = on_disk_bounding_coordinates(smap)
      smap = smap.submap(bottom_left, top_right=top_right)
  `,
  },
];

export const hyperNovaRepo: Repo = {
  label: "HyperNova",
  url: "https://github.com/airbnb/hypernova",
  files: files,
};

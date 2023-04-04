import { Repo, RepoFile } from "./constants";

const files: RepoFile[] = [
  {
    path: "sunpy/physics/differential_rotation.py",
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
    )`,
  },
  {
    path: "sunpy/conftest.py",
    code: `
@pytest.fixture()
def sunpy_cache(mocker, tmp_path):

  def add(self, url, path):
    self._storage.store({
      'url': url,
      'file_path': path,
      'file_hash': 'none', # hash doesn't matter
    })
  cache.add = MethodType(add, cache)

  def func(mocked):
    mocker.patch(mocked, cache)
    return cache
  yield func`,
  },
  {
    path: "sunpy/physics/differential_rotation.py",
    code: `
def differential_rotate(smap, observer=None, time=None, **diff_rot_kwargs):
  if is_all_off_disk(smap):
    raise ValueError("The entire map is off disk. No data to differentially rotate.")

  new_observer = _get_new_observer(smap.date, observer, time)
  is_sub_full_disk = not contains_full_disk(smap)
  if is_sub_full_disk:
    if not is_all_on_disk(smap):
      smap = smap.submap(bottom_left, top_right=top_right)`,
  },
  {
    path: "sunpy/tests/tests/test_self_test.py",
    code: `
def test_main_noargs(monkeypatch):
  test_args = _self_test_args()
  assert test_args == ['-W', 'ignore', '--pyargs', 'sunpy']

def test_main_submodule_map(monkeypatch):
  args = _self_test_args(package='map')
  assert args == ['-W', 'ignore', '--pyargs', 'sunpy.map']

def test_main_submodule_jsoc(monkeypatch):
  args = _self_test_args(package='net.jsoc')
  assert args == ['-W', 'ignore', '--pyargs', 'sunpy.net.jsoc']`,
  },
];

export const sunPyRepo: Repo = {
  label: "SunPy",
  url: "https://github.com/sunpy/sunpy",
  files: files,
};
